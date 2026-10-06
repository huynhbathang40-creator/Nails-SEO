import { useCallback, useEffect, useState } from 'react';
import { ACTION_LABEL, adminApi, download, fmtDate, timeAgo, toCsv } from './api.js';

const ACTION_TAG = {
  role_changed: '', password_set: 'amber', user_blocked: 'pink', user_unblocked: 'green', email_confirmed: 'green',
  signed_out: 'grey', profile_edited: 'blue', user_created: 'green', user_deleted: 'pink',
};

function describe(e) {
  const d = e.details || {};
  if (e.action === 'role_changed') return `${d.from || 'user'} → ${d.to}`;
  if (e.action === 'user_created') return `as ${d.role || 'user'}`;
  if (e.action === 'profile_edited') return Object.keys(d).join(', ');
  return '';
}

// Every change an admin made, newest first.
export default function Activity() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try { setRows(await adminApi.auditLog(500)); setErr(''); } catch (e) { setErr(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const actions = [...new Set((rows || []).map((r) => r.action))];
  const shown = (rows || []).filter((r) => filter === 'all' || r.action === filter);

  return (
    <>
      <div className="app-top">
        <div>
          <h1>Activity log</h1>
          <p>Every admin action is recorded here and can't be edited.</p>
        </div>
        <div className="hstack">
          <button type="button" className="btn btn-quiet btn-sm" onClick={load}>Refresh</button>
          <button type="button" className="btn btn-quiet btn-sm" disabled={!shown.length} onClick={() => download(`glowback-activity-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(shown, [
            { label: 'When', get: (r) => r.at }, { label: 'Admin', get: (r) => r.actor_email }, { label: 'Action', get: (r) => ACTION_LABEL[r.action] || r.action },
            { label: 'User', get: (r) => r.target_email }, { label: 'Details', get: (r) => describe(r) },
          ]))}>Export CSV</button>
        </div>
      </div>
      <section className="panel">
        {actions.length > 1 && (
          <div className="chips" style={{ marginBottom: 10 }}>
            <button type="button" className="chip" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All</button>
            {actions.map((a) => <button key={a} type="button" className="chip" aria-pressed={filter === a} onClick={() => setFilter(a)}>{ACTION_LABEL[a] || a}</button>)}
          </div>
        )}
        {err && <p className="err">{err}</p>}
        {!rows && !err && <div className="empty">Loading…</div>}
        {rows && shown.length === 0 && <div className="empty">No admin actions yet. Changes you make on the Users page will appear here.</div>}
        {shown.map((r) => (
          <div key={r.id} className="row" style={{ flexWrap: 'wrap' }}>
            <span className={`tag ${ACTION_TAG[r.action] ?? 'grey'}`} style={{ minWidth: 120, justifyContent: 'center' }}>{ACTION_LABEL[r.action] || r.action}</span>
            <div className="grow" style={{ minWidth: 200 }}>
              <div><strong>{r.target_email || '—'}</strong>{describe(r) && <span className="muted"> · {describe(r)}</span>}</div>
              <div className="muted small">by {r.actor_email || 'system'}</div>
            </div>
            <span className="muted small" title={fmtDate(r.at, true)}>{timeAgo(r.at)}</span>
          </div>
        ))}
      </section>
    </>
  );
}
