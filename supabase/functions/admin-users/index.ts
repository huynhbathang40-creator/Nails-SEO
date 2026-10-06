// Admin actions that need Supabase's service key (create and delete accounts).
// Called from the GlowBack admin page. Only administrators may create or delete users;
// administrators and employees may "ping" (used by the monitoring panel).
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const ROLES = ['admin', 'employee', 'user'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // Who is calling?
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: caller, error: callerError } = await admin.auth.getUser(token);
  if (callerError || !caller?.user) return json(401, { error: 'Please sign in again.' });
  const me = caller.user;

  const { data: roleRow } = await admin.from('user_roles').select('role').eq('user_id', me.id).maybeSingle();
  const myRole = roleRow?.role ?? 'user';
  if (myRole !== 'admin' && myRole !== 'employee') return json(403, { error: 'Administrators only.' });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty body */ }
  const action = String(body.action || '');

  const audit = async (act: string, targetId: string | null, targetEmail: string | null, details: Record<string, unknown> = {}) => {
    await admin.from('admin_audit_log').insert({ actor_id: me.id, actor_email: me.email, action: act, target_id: targetId, target_email: targetEmail, details });
  };

  if (action === 'ping') {
    return json(200, { ok: true, role: myRole, time: new Date().toISOString(), region: Deno.env.get('SB_REGION') || null });
  }

  if (myRole !== 'admin') return json(403, { error: 'Only administrators can do this.' });

  if (action === 'create_user') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const fullName = String(body.full_name || '').trim().slice(0, 100);
    const role = ROLES.includes(String(body.role)) ? String(body.role) : 'user';
    if (!/^\S+@\S+\.\S+$/.test(email)) return json(400, { error: 'Please enter a valid email.' });
    if (password.length < 6) return json(400, { error: 'Password must be at least 6 characters.' });

    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: fullName },
    });
    if (error) return json(400, { error: error.message.includes('already') ? 'This email already has an account.' : error.message });
    const id = data.user.id;
    if (role !== 'user') await admin.from('user_roles').upsert({ user_id: id, role, updated_by: me.id, updated_at: new Date().toISOString() });
    await audit('user_created', id, email, { role });
    return json(200, { ok: true, id });
  }

  if (action === 'delete_user') {
    const target = String(body.user_id || '');
    if (!target) return json(400, { error: 'Missing user.' });
    if (target === me.id) return json(400, { error: "You can't delete your own account here." });
    const { data: targetRole } = await admin.from('user_roles').select('role').eq('user_id', target).maybeSingle();
    if (targetRole?.role === 'admin') {
      const { count } = await admin.from('user_roles').select('user_id', { count: 'exact', head: true }).eq('role', 'admin');
      if ((count ?? 0) <= 1) return json(400, { error: 'There must always be at least one administrator.' });
    }
    const { data: t } = await admin.auth.admin.getUserById(target);
    if (!t?.user) return json(404, { error: 'User not found.' });
    // Remove their profile photos first.
    const { data: files } = await admin.storage.from('avatars').list(target, { limit: 100 });
    if (files?.length) await admin.storage.from('avatars').remove(files.map((f) => `${target}/${f.name}`));
    const { error } = await admin.auth.admin.deleteUser(target);
    if (error) return json(400, { error: error.message });
    await audit('user_deleted', null, t.user.email ?? null, { deleted_user_id: target });
    return json(200, { ok: true });
  }

  return json(400, { error: 'Unknown action.' });
});
