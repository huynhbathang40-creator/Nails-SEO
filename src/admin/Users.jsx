import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Copy, Plus, Search, Upload } from '../components/Icons.jsx';
import { Avatar } from '../app/Avatar.jsx';
import { copyText, Modal } from '../app/ui.jsx';
import { useAuth } from '../lib/auth.jsx';
import { fmtPhone, isEmail } from '../lib/calc.js';
import { adminApi, download, fmtDate, ROLE_DESC, ROLE_LABEL, STATUS_LABEL, STATUS_TAG, timeAgo, toCsv, userStatus } from './api.js';

const ROLE_TAG = { admin: '', employee: 'blue', user: 'grey' };
const ROLES = ['admin', 'employee', 'user'];

export function newPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const buf = new Uint32Array(12);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => chars[n % chars.length]).join('');
}

function Section({ title, children }) {
  return (
    <section style={{ borderTop: '1px solid var(--line)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
      {children}
    </section>
  );
}

function UserPanel({ u, me, isAdmin, onClose, onChanged, toast }) {
  const [role, setRole] = useState(u.role);
  const [pw, setPw] = useState('');
  const [profile, setProfile] = useState({ full_name: u.full_name || '', salon_name: u.salon_name || '', phone: u.phone || '', city: u.city || '' });
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const isMe = u.id === me;
  const status = userStatus(u);

  const run = async (key, fn, msg, close = false) => {
    setBusy(key); setErr('');
    try {
      await fn();
      toast(msg);
      await onChanged();
      if (close) onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <Modal title={u.full_name || u.email} sub={u.full_name ? u.email : null} onClose={onClose} width={640}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
        <Avatar url={u.avatar_url} name={u.full_name || u.email} size={64} />
        <div className="hstack">
          <span className={`tag ${ROLE_TAG[u.role]}`}>{ROLE_LABEL[u.role]}</span>
          <span className={`tag ${STATUS_TAG[status]}`}>{STATUS_LABEL[status]}</span>
          {isMe && <span className="tag green">This is you</span>}
        </div>
      </div>

      <dl className="kv">
        <dt>Email</dt><dd>{u.email}</dd>
        <dt>Salon</dt><dd>{[u.salon_name, u.city].filter(Boolean).join(' · ') || '—'}</dd>
        <dt>Phone</dt><dd>{u.phone || '—'}</dd>
        <dt>Language</dt><dd>{u.preferred_language === 'vi' ? 'Tiếng Việt' : u.preferred_language === 'en' ? 'English' : '—'}</dd>
        {u.bio && (<><dt>Bio</dt><dd style={{ fontWeight: 400 }}>{u.bio}</dd></>)}
        <dt>Joined</dt><dd>{fmtDate(u.created_at, true)}</dd>
        <dt>Last sign-in</dt><dd>{u.last_sign_in_at ? `${timeAgo(u.last_sign_in_at)} (${fmtDate(u.last_sign_in_at, true)})` : 'Never'}</dd>
        <dt>Email confirmed</dt><dd>{u.email_confirmed_at ? fmtDate(u.email_confirmed_at, true) : 'No'}</dd>
        <dt>Profile created</dt><dd>{u.profile_completed_at ? fmtDate(u.profile_completed_at, true) : 'Not yet'}</dd>
        {u.google_review_link && (<><dt>Google link</dt><dd><a href={u.google_review_link} target="_blank" rel="noreferrer">{u.google_review_link}</a></dd></>)}
        <dt>User ID</dt><dd style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{u.id}</dd>
      </dl>

      {!isAdmin ? (
        <p className="muted small" style={{ margin: 0 }}>Only administrators can change users.</p>
      ) : (
        <>
          <Section title="Role">
            <div className="chips" role="radiogroup" aria-label="Role">
              {ROLES.map((r) => <button key={r} type="button" className="chip" role="radio" aria-checked={role === r} aria-pressed={role === r} onClick={() => setRole(r)}>{ROLE_LABEL[r]}</button>)}
            </div>
            <p className="muted small" style={{ margin: 0 }}>{ROLE_DESC[role]}</p>
            <div><button type="button" className="btn btn-primary btn-sm" disabled={role === u.role || !!busy} onClick={() => run('role', () => adminApi.setRole(u.id, role), `Role changed to ${ROLE_LABEL[role]}`)}>{busy === 'role' ? 'Saving…' : 'Save role'}</button></div>
          </Section>

          <Section title="Password">
            <p className="muted small" style={{ margin: 0 }}>Set a new password and share it with the user. They'll be signed out of other devices.</p>
            <div className="hstack">
              <input className="input input-sm" style={{ flex: '1 1 200px', width: 'auto', fontFamily: 'ui-monospace, monospace' }} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (6+ characters)" aria-label="New password" />
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setPw(newPassword())}>Generate</button>
              {pw && <button type="button" className="btn btn-quiet btn-sm" onClick={async () => (await copyText(pw)) && toast('Password copied')}><Copy size={14} />Copy</button>}
            </div>
            <div><button type="button" className="btn btn-primary btn-sm" disabled={pw.length < 6 || !!busy} onClick={() => run('pw', () => adminApi.setPassword(u.id, pw), 'Password updated')}>{busy === 'pw' ? 'Saving…' : 'Set password'}</button></div>
          </Section>

          <Section title="Profile">
            {u.profile_completed_at ? (
              <>
                <div className="grid-2">
                  <label className="field">Name<input className="input input-sm" maxLength={100} value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></label>
                  <label className="field">Salon<input className="input input-sm" maxLength={120} value={profile.salon_name} onChange={(e) => setProfile({ ...profile, salon_name: e.target.value })} /></label>
                  <label className="field">Phone<input className="input input-sm" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: fmtPhone(e.target.value) })} /></label>
                  <label className="field">City<input className="input input-sm" maxLength={100} value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></label>
                </div>
                <div><button type="button" className="btn btn-quiet btn-sm" disabled={!!busy || !profile.full_name.trim()} onClick={() => run('profile', () => adminApi.updateProfile(u.id, profile), 'Profile saved')}>{busy === 'profile' ? 'Saving…' : 'Save profile'}</button></div>
              </>
            ) : <p className="muted small" style={{ margin: 0 }}>This user hasn't created a profile yet.</p>}
          </Section>

          <Section title="Account">
            <div className="hstack">
              {!u.email_confirmed_at && <button type="button" className="btn btn-quiet btn-sm" disabled={!!busy} onClick={() => run('confirm', () => adminApi.confirmEmail(u.id), 'Email confirmed')}>Confirm email</button>}
              {!isMe && (status === 'blocked'
                ? <button type="button" className="btn btn-quiet btn-sm" disabled={!!busy} onClick={() => run('block', () => adminApi.setBlocked(u.id, false), 'User unblocked')}>Unblock user</button>
                : <button type="button" className="btn btn-danger btn-sm" disabled={!!busy} onClick={() => run('block', () => adminApi.setBlocked(u.id, true), 'User blocked')}>Block user</button>)}
              <button type="button" className="btn btn-quiet btn-sm" disabled={!!busy} onClick={() => run('signout', () => adminApi.signOutUser(u.id), 'Signed out of all devices')}>Sign out everywhere</button>
            </div>
          </Section>

          {!isMe && (
            <Section title="Delete account">
              <p className="muted small" style={{ margin: 0 }}>Permanently deletes this user, their profile and photo. Type their email to confirm.</p>
              <div className="hstack">
                <input className="input input-sm" style={{ flex: '1 1 220px', width: 'auto' }} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={u.email} aria-label="Type the email to confirm" />
                <button type="button" className="btn btn-danger btn-sm" disabled={confirmText.trim().toLowerCase() !== u.email.toLowerCase() || !!busy} onClick={() => run('delete', () => adminApi.deleteUser(u.id), 'User deleted', true)}>{busy === 'delete' ? 'Deleting…' : 'Delete user'}</button>
              </div>
            </Section>
          )}
        </>
      )}
      {err && <p className="err" role="alert">{err}</p>}
    </Modal>
  );
}

function AddUser({ onClose, onCreated, toast }) {
  const [f, setF] = useState({ email: '', full_name: '', password: newPassword(), role: 'user' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(f.email.trim())) return setErr('Please enter a valid email.');
    if (f.password.length < 6) return setErr('Password must be at least 6 characters.');
    setBusy(true); setErr('');
    try {
      await adminApi.createUser({ ...f, email: f.email.trim() });
      await copyText(`Email: ${f.email.trim()}\nPassword: ${f.password}`);
      toast('User created · sign-in details copied');
      await onCreated();
      onClose();
    } catch (error) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Add a user" sub="The account is ready to use right away (email already confirmed)." onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        <label className="field">Email<input className="input" type="email" autoFocus value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="name@salon.com" /></label>
        <label className="field">Name (optional)<input className="input" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} placeholder="Kim Le" /></label>
        <label className="field">Temporary password
          <div className="hstack" style={{ flexWrap: 'nowrap' }}>
            <input className="input" style={{ fontFamily: 'ui-monospace, monospace' }} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setF({ ...f, password: newPassword() })}>New</button>
          </div>
        </label>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Role</legend>
          <div className="chips">{ROLES.map((r) => <button key={r} type="button" className="chip" aria-pressed={f.role === r} onClick={() => setF({ ...f, role: r })}>{ROLE_LABEL[r]}</button>)}</div>
          <p className="muted small" style={{ margin: '6px 0 0' }}>{ROLE_DESC[f.role]}</p>
        </fieldset>
        {err && <p className="err" role="alert">{err}</p>}
        <div className="hstack">
          <button type="button" className="btn btn-quiet" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={busy}>{busy ? 'Creating…' : 'Create user'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Users() {
  const { toast } = useOutletContext();
  const auth = useAuth();
  const [params, setParams] = useSearchParams();
  const [users, setUsers] = useState(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const roleFilter = params.get('role') || 'all';
  const statusFilter = params.get('status') || 'all';

  const load = useCallback(async () => {
    try { setUsers(await adminApi.listUsers()); setErr(''); } catch (e) { setErr(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const setFilter = (k, v) => {
    const next = new URLSearchParams(params);
    if (v === 'all') next.delete(k); else next.set(k, v);
    setParams(next);
  };

  const shown = useMemo(() => (users || []).filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && userStatus(u) !== statusFilter) return false;
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return [u.email, u.full_name, u.salon_name, u.city, u.phone].some((v) => (v || '').toLowerCase().includes(needle));
  }), [users, roleFilter, statusFilter, q]);

  const exportCsv = () => {
    const csv = toCsv(shown, [
      { label: 'Email', get: (u) => u.email }, { label: 'Name', get: (u) => u.full_name },
      { label: 'Role', get: (u) => u.role }, { label: 'Status', get: (u) => STATUS_LABEL[userStatus(u)] },
      { label: 'Salon', get: (u) => u.salon_name }, { label: 'City', get: (u) => u.city }, { label: 'Phone', get: (u) => u.phone },
      { label: 'Joined', get: (u) => u.created_at }, { label: 'Last sign-in', get: (u) => u.last_sign_in_at || '' },
    ]);
    download(`glowback-users-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const open = users?.find((u) => u.id === openId);
  const count = (fn) => (users || []).filter(fn).length;

  return (
    <>
      <div className="app-top">
        <div>
          <h1>Users</h1>
          <p>{users ? `${users.length} accounts` : 'Loading…'} · click someone to see details and manage their account.</p>
        </div>
        <div className="hstack">
          <button type="button" className="btn btn-quiet btn-sm" onClick={exportCsv} disabled={!shown.length}><Upload size={16} />Export CSV</button>
          {auth.isAdmin && <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={16} />Add user</button>}
        </div>
      </div>

      <section className="panel">
        <div className="stack" style={{ marginBottom: 8 }}>
          <label style={{ position: 'relative', display: 'block' }}>
            <span className="sr-only">Search users</span>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}><Search /></span>
            <input className="input input-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, salon, city or phone" style={{ paddingLeft: 44 }} />
          </label>
          <div className="chips" role="group" aria-label="Filter by role">
            {['all', ...ROLES].map((r) => (
              <button key={r} type="button" className="chip" aria-pressed={roleFilter === r} onClick={() => setFilter('role', r)}>
                {r === 'all' ? 'All roles' : ROLE_LABEL[r]} <span style={{ opacity: 0.7 }}>{r === 'all' ? users?.length ?? '' : count((u) => u.role === r)}</span>
              </button>
            ))}
          </div>
          <div className="chips" role="group" aria-label="Filter by status">
            {['all', 'active', 'no_profile', 'unconfirmed', 'blocked'].map((st) => (
              <button key={st} type="button" className="chip" aria-pressed={statusFilter === st} onClick={() => setFilter('status', st)}>
                {st === 'all' ? 'Any status' : STATUS_LABEL[st]} <span style={{ opacity: 0.7 }}>{st === 'all' ? '' : count((u) => userStatus(u) === st)}</span>
              </button>
            ))}
          </div>
        </div>

        {err && <p className="err">{err}</p>}
        {!users && !err && <div className="empty">Loading users…</div>}
        {users && shown.length === 0 && <div className="empty">No users match.</div>}
        {shown.map((u) => {
          const st = userStatus(u);
          return (
            <button key={u.id} type="button" className="user-row" onClick={() => setOpenId(u.id)}>
              <Avatar url={u.avatar_url} name={u.full_name || u.email} size={40} />
              <div className="grow" style={{ minWidth: 180 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  <strong className="truncate">{u.full_name || u.email}</strong>
                  <span className={`tag ${ROLE_TAG[u.role]}`}>{ROLE_LABEL[u.role]}</span>
                  {st !== 'active' && <span className={`tag ${STATUS_TAG[st]}`}>{STATUS_LABEL[st]}</span>}
                  {u.id === auth.user.id && <span className="tag green">You</span>}
                </div>
                <div className="muted small truncate">{u.email}{u.salon_name ? ` · ${u.salon_name}` : ''}{u.city ? ` · ${u.city}` : ''}</div>
              </div>
              <div className="muted small" style={{ textAlign: 'right', minWidth: 120 }}>
                <div>Joined {fmtDate(u.created_at)}</div>
                <div>Last seen {timeAgo(u.last_sign_in_at)}</div>
              </div>
            </button>
          );
        })}
      </section>

      {open && <UserPanel key={open.id} u={open} me={auth.user.id} isAdmin={auth.isAdmin} toast={toast} onChanged={async () => { await load(); if (open.id === auth.user.id) auth.reloadRole(); }} onClose={() => setOpenId(null)} />}
      {adding && <AddUser toast={toast} onCreated={load} onClose={() => setAdding(false)} />}
    </>
  );
}
