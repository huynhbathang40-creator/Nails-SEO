import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { SUPABASE_URL } from '../lib/supabase.js';
import { adminApi, fmtBytes, fmtDate, runHealthChecks, timeAgo } from './api.js';

const CHECK_LABEL = { database: 'Database', auth: 'Login service', storage: 'File storage', functions: 'Admin functions' };

function HealthCard({ check }) {
  const state = !check ? 'wait' : check.ok ? 'ok' : 'bad';
  const name = check?.name;
  return (
    <div className="health">
      <span className={`dot ${state}`} aria-hidden="true" />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600 }}>{CHECK_LABEL[name] || '…'}</div>
        <div className="small" style={{ fontWeight: 600, color: state === 'ok' ? 'var(--green)' : state === 'bad' ? 'var(--red)' : 'var(--muted)' }}>
          {state === 'ok' ? `✓ Online · ${check.ms} ms` : state === 'bad' ? '✕ Problem' : 'Checking…'}
        </div>
        {check && <div className="muted small" style={{ wordBreak: 'break-word' }}>{check.detail}</div>}
      </div>
    </div>
  );
}

function Stat({ label, value, hint, to }) {
  const body = (
    <>
      <div className="lbl">{label}</div>
      <div className="num" style={{ fontSize: 40 }}>{value ?? '—'}</div>
      {hint && <div className="muted small">{hint}</div>}
    </>
  );
  return to ? <Link to={to} className="stat" style={{ textDecoration: 'none', color: 'inherit' }}>{body}</Link> : <div className="stat">{body}</div>;
}

// Single-series bar chart: new sign-ups per day. Hover/focus a bar for its value.
function SignupChart({ data }) {
  const [tip, setTip] = useState(null);
  const W = 720, H = 200, pad = { l: 28, r: 8, t: 12, b: 26 };
  const max = Math.max(1, ...data.map((d) => d.signups));
  const ticks = max <= 4 ? Array.from({ length: max + 1 }, (_, i) => i) : [0, Math.round(max / 2), max];
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const step = iw / data.length;
  const bw = Math.max(2, step - 2);
  const y = (v) => pad.t + ih - (v / max) * ih;
  const label = (d) => new Date(d.day + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const total = data.reduce((s, d) => s + Number(d.signups), 0);

  return (
    <figure style={{ margin: 0 }}>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`New sign-ups per day, last ${data.length} days: ${total} total`} style={{ display: 'block' }}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#EEE9F2" strokeWidth="1" />
              <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#5F6673">{t}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = pad.l + i * step + 1;
            const v = Number(d.signups);
            const h = Math.max(0, (v / max) * ih);
            const top = pad.t + ih - h;
            const r = Math.min(4, bw / 2, h);
            const path = h > 0
              ? `M${x},${pad.t + ih} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${pad.t + ih} Z`
              : '';
            const show = () => setTip({ x: ((x + bw / 2) / W) * 100, y: (Math.min(top, pad.t + ih - 4) / H) * 100, text: `${label(d)}: ${v} sign-up${v === 1 ? '' : 's'}` });
            return (
              <g key={d.day}>
                {/* Hit target taller than the bar */}
                <rect x={pad.l + i * step} y={pad.t} width={step} height={ih} fill="transparent" onMouseEnter={show} onMouseLeave={() => setTip(null)} />
                {h > 0 && <path d={path} className="chart-bar" tabIndex={0} onFocus={show} onBlur={() => setTip(null)} onMouseEnter={show} onMouseLeave={() => setTip(null)} aria-label={`${label(d)}: ${v}`} />}
              </g>
            );
          })}
          <line x1={pad.l} x2={W - pad.r} y1={pad.t + ih} y2={pad.t + ih} stroke="#D1D5DB" strokeWidth="1" />
          {[0, Math.floor(data.length / 2), data.length - 1].filter((i) => data[i]).map((i) => (
            <text key={i} x={pad.l + i * step + step / 2} y={H - 6} textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'} fontSize="11" fill="#5F6673">{label(data[i])}</text>
          ))}
        </svg>
        {tip && <div className="chart-tip" style={{ left: `${tip.x}%`, top: `calc(${tip.y}% - 8px)` }}>{tip.text}</div>}
      </div>
      <table className="sr-only">
        <caption>New sign-ups per day</caption>
        <thead><tr><th>Day</th><th>Sign-ups</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.day}><td>{d.day}</td><td>{d.signups}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

export default function Overview() {
  const { user } = useAuth();
  const [checks, setChecks] = useState(null);
  const [status, setStatus] = useState(null);
  const [series, setSeries] = useState([]);
  const [err, setErr] = useState('');
  const [checkedAt, setCheckedAt] = useState(null);
  const [auto, setAuto] = useState(true);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const refresh = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const [c, s, d] = await Promise.all([
      runHealthChecks(user.id),
      adminApi.systemStatus().catch((e) => { setErr(e.message); return null; }),
      adminApi.signupsByDay(30).catch(() => []),
    ]);
    setChecks(c);
    if (s) { setStatus(s); setErr(''); }
    setSeries(d || []);
    setCheckedAt(new Date());
    busyRef.current = false;
    setBusy(false);
  }, [user.id]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [auto, refresh]);

  const allOk = checks && checks.every((c) => c.ok);
  const s = status || {};
  const uptime = s.db_started_at ? timeAgo(s.db_started_at).replace(' ago', '') : '—';

  return (
    <>
      <div className="app-top">
        <div>
          <h1>Admin overview</h1>
          <p>Live health of the site and how GlowBack is being used.</p>
        </div>
        <div className="hstack">
          <label className="check" style={{ fontSize: 14 }}><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />Auto-refresh every 30 s</label>
          <button type="button" className="btn btn-primary btn-sm" onClick={refresh} disabled={busy}>{busy ? 'Checking…' : 'Refresh now'}</button>
        </div>
      </div>

      <section className="panel stack">
        <div className="panel-head" style={{ marginBottom: 0 }}>
          <h2>System status</h2>
          <span className={`tag ${!checks ? 'grey' : allOk ? 'green' : 'pink'}`}>
            {!checks ? 'Checking…' : allOk ? '✓ All systems working' : '✕ Something needs attention'}
          </span>
        </div>
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
          {(checks || ['database', 'auth', 'storage', 'functions'].map(() => null)).map((c, i) => <HealthCard key={c?.name || i} check={c} />)}
        </div>
        <div className="muted small">
          Website: <strong>{window.location.host}</strong> (served by Netlify) · Backend: {SUPABASE_URL.replace('https://', '')}
          {checkedAt && <> · Last checked {checkedAt.toLocaleTimeString()}</>}
        </div>
        {err && <p className="err">{err}</p>}
      </section>

      <div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Users</div>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
          <Stat label="Total users" value={s.users_total} hint={s.roles ? `${s.roles.admin} admin · ${s.roles.employee} employee · ${s.roles.user} user` : null} to="/admin/users" />
          <Stat label="Active last 7 days" value={s.active_7d} hint={s.active_24h != null ? `${s.active_24h} in the last 24 h` : null} />
          <Stat label="New in 30 days" value={s.signups_30d} hint={s.signups_7d != null ? `${s.signups_7d} in the last 7 days` : null} />
          <Stat label="Profiles created" value={s.profiles_completed} hint={s.users_total != null ? `${Math.max(0, s.users_total - (s.profiles_completed || 0))} still to create one` : null} />
          <Stat label="Email not confirmed" value={s.users_total != null ? s.users_total - s.users_confirmed : null} to="/admin/users?status=unconfirmed" />
          <Stat label="Blocked" value={s.users_blocked} to="/admin/users?status=blocked" />
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>New sign-ups</h2>
            <div className="muted small">Accounts created per day, last 30 days</div>
          </div>
        </div>
        {series.length ? <SignupChart data={series} /> : <div className="empty">Loading…</div>}
      </section>

      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20 }}>
        <section className="panel">
          <div className="panel-head"><h2>Database</h2></div>
          <dl className="kv">
            <dt>Status</dt><dd>{checks?.[0]?.ok ? <span style={{ color: 'var(--green)' }}>✓ Connected ({checks[0].ms} ms)</span> : checks ? <span style={{ color: 'var(--red)' }}>✕ Not reachable</span> : '…'}</dd>
            <dt>Server time</dt><dd>{fmtDate(s.db_time, true)}</dd>
            <dt>Postgres</dt><dd>{s.postgres_version || '—'}</dd>
            <dt>Running for</dt><dd>{uptime}</dd>
            <dt>Size</dt><dd>{fmtBytes(s.db_size_bytes)}</dd>
            <dt>Connections</dt><dd>{s.connections != null ? `${s.connections} of ${s.max_connections}` : '—'}</dd>
            <dt>Admin actions (24 h)</dt><dd>{s.admin_actions_24h ?? '—'}</dd>
          </dl>
        </section>
        <section className="panel">
          <div className="panel-head"><h2>Tables & storage</h2></div>
          <dl className="kv">
            {(s.tables || []).map((t) => (
              <FragmentRow key={t.name} k={t.name} v={`${t.rows} rows · ${fmtBytes(t.bytes)}`} />
            ))}
            <dt>Profile photos</dt><dd>{s.avatars_count != null ? `${s.avatars_count} files · ${fmtBytes(s.avatars_bytes)}` : '—'}</dd>
          </dl>
          <p className="muted small" style={{ margin: '14px 0 0' }}>
            Full logs and backups: <a href="https://supabase.com/dashboard/project/oikijxuckkwkcmcjkewb" target="_blank" rel="noreferrer">Supabase dashboard</a> · Site deploys and form sign-ups: <a href="https://app.netlify.com" target="_blank" rel="noreferrer">Netlify dashboard</a>
          </p>
        </section>
      </div>
    </>
  );
}

function FragmentRow({ k, v }) {
  return (<><dt>{k}</dt><dd>{v}</dd></>);
}
