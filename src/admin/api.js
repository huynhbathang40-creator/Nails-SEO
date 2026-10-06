import { supabase, SUPABASE_KEY, SUPABASE_URL } from '../lib/supabase.js';

// Turn Supabase errors into plain messages.
const fail = (error) => { throw new Error(error?.message || 'Something went wrong.'); };

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) fail(error);
  return data;
}

// Calls the "admin-users" Edge Function (create / delete accounts, ping).
async function fn(body) {
  const { data, error } = await supabase.functions.invoke('admin-users', { body });
  if (error) {
    let msg = error.message;
    try { msg = (await error.context.json()).error || msg; } catch { /* not JSON */ }
    throw new Error(msg);
  }
  return data;
}

export const adminApi = {
  listUsers: () => rpc('admin_list_users'),
  systemStatus: () => rpc('admin_system_status'),
  signupsByDay: (days = 30) => rpc('admin_signups_by_day', { days }),
  setRole: (target, role) => rpc('admin_set_role', { target, new_role: role }),
  setPassword: (target, password) => rpc('admin_set_password', { target, new_password: password }),
  setBlocked: (target, blocked) => rpc('admin_set_banned', { target, banned: blocked }),
  confirmEmail: (target) => rpc('admin_confirm_email', { target }),
  signOutUser: (target) => rpc('admin_sign_out_user', { target }),
  updateProfile: (target, patch) => rpc('admin_update_profile', { target, patch }),
  createUser: (fields) => fn({ action: 'create_user', ...fields }),
  deleteUser: (userId) => fn({ action: 'delete_user', user_id: userId }),
  async auditLog(limit = 200) {
    const { data, error } = await supabase.from('admin_audit_log').select('*').order('at', { ascending: false }).limit(limit);
    if (error) fail(error);
    return data;
  },
};

// Times one check; never throws.
async function timed(name, run) {
  const t0 = performance.now();
  try {
    const detail = await run();
    return { name, ok: true, ms: Math.round(performance.now() - t0), detail };
  } catch (e) {
    return { name, ok: false, ms: Math.round(performance.now() - t0), detail: e.message || String(e) };
  }
}

// Live health checks run from the admin's browser.
export async function runHealthChecks(userId) {
  return Promise.all([
    timed('database', async () => {
      const { data, error } = await supabase.rpc('admin_system_status');
      if (error) throw error;
      return `Postgres ${data.postgres_version} · ${data.connections} connections`;
    }),
    timed('auth', async () => {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, { headers: { apikey: SUPABASE_KEY } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json().catch(() => ({}));
      return body.version ? `${body.name || 'GoTrue'} ${body.version}` : 'Responding';
    }),
    timed('storage', async () => {
      const { error } = await supabase.storage.from('avatars').list(userId, { limit: 1 });
      if (error) throw error;
      return 'Profile photo storage reachable';
    }),
    timed('functions', async () => {
      const r = await fn({ action: 'ping' });
      return `admin-users function OK${r.region ? ` · ${r.region}` : ''}`;
    }),
  ]);
}

export function toCsv(rows, columns) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.map((c) => c.label).join(','), ...rows.map((r) => columns.map((c) => esc(c.get(r))).join(','))].join('\n');
}

export function download(filename, text, type = 'text/csv') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const fmtBytes = (n) => {
  if (!n) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`;
};

export const fmtDate = (d, withTime = false) =>
  d ? new Date(d).toLocaleString('en-US', withTime ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' } : { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const timeAgo = (d) => {
  if (!d) return 'Never';
  const s = Math.max(0, (Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return fmtDate(d);
};

export const userStatus = (u) => {
  if (u.banned_until && new Date(u.banned_until) > new Date()) return 'blocked';
  if (!u.email_confirmed_at) return 'unconfirmed';
  if (!u.profile_completed_at) return 'no_profile';
  return 'active';
};

export const STATUS_LABEL = { active: 'Active', blocked: 'Blocked', unconfirmed: 'Email not confirmed', no_profile: 'No profile yet' };
export const STATUS_TAG = { active: 'green', blocked: 'pink', unconfirmed: 'amber', no_profile: 'grey' };
export const ROLE_LABEL = { admin: 'Admin', employee: 'Employee', user: 'User' };
export const ROLE_DESC = {
  admin: 'Full access: manage users, roles, passwords and everything in the admin area.',
  employee: 'GlowBack staff: can view users, activity and monitoring, but cannot change anything.',
  user: 'Salon owner: uses the GlowBack app. No admin access.',
};

export const ACTION_LABEL = {
  role_changed: 'Changed role',
  password_set: 'Set a new password',
  user_blocked: 'Blocked user',
  user_unblocked: 'Unblocked user',
  email_confirmed: 'Confirmed email',
  signed_out: 'Signed user out everywhere',
  profile_edited: 'Edited profile',
  user_created: 'Created user',
  user_deleted: 'Deleted user',
};
