import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { authErrorMessage, useAuth } from '../lib/auth.jsx';
import { fmtPhone } from '../lib/calc.js';
import { useLang } from '../lib/i18n.jsx';
import { useStore } from '../lib/store.jsx';
import { initials, useS } from './ui.jsx';

const fromProfile = (p) => ({
  full_name: p?.full_name || '',
  salon_name: p?.salon_name || '',
  phone: p?.phone || '',
  city: p?.city || '',
  preferred_language: p?.preferred_language === 'vi' ? 'vi' : 'en',
});

export default function Profile() {
  const all = useS();
  const s = all.profile;
  const { lang, setLang } = useLang();
  const { toast } = useOutletContext();
  const auth = useAuth();
  const store = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => fromProfile(auth.profile));
  const [syncSalon, setSyncSalon] = useState(true);
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');
  const [pw, setPw] = useState({ next: '', confirm: '', status: 'idle', err: '' });

  useEffect(() => { setForm(fromProfile(auth.profile)); }, [auth.profile]);

  const set = (k, fmt) => (e) => { setForm((f) => ({ ...f, [k]: fmt ? fmt(e.target.value) : e.target.value })); setErr(''); };
  const dirty = JSON.stringify(form) !== JSON.stringify(fromProfile(auth.profile));

  const save = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return setErr(all.auth.nameErr);
    setStatus('loading');
    try {
      const saved = await auth.updateProfile({ ...form, full_name: form.full_name.trim(), salon_name: form.salon_name.trim(), city: form.city.trim() });
      if (syncSalon && store.salon && !store.sample) {
        store.updateSalon({
          ...(saved.salon_name ? { name: saved.salon_name } : {}),
          owner: saved.full_name,
          ...(saved.phone ? { phone: saved.phone } : {}),
          ...(saved.city ? { city: saved.city } : {}),
        });
      }
      if (saved.preferred_language !== lang) setLang(saved.preferred_language);
      toast(s.saved);
    } catch (error) {
      setErr(authErrorMessage(error, lang));
    } finally {
      setStatus('idle');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.next.length < 6) return setPw((p) => ({ ...p, err: all.auth.passwordErr }));
    if (pw.next !== pw.confirm) return setPw((p) => ({ ...p, err: s.mismatch }));
    setPw((p) => ({ ...p, status: 'loading', err: '' }));
    try {
      await auth.updatePassword(pw.next);
      setPw({ next: '', confirm: '', status: 'idle', err: '' });
      toast(s.passwordChanged);
    } catch (error) {
      setPw((p) => ({ ...p, status: 'idle', err: authErrorMessage(error, lang) }));
    }
  };

  const signOut = async () => {
    await auth.signOut();
    navigate('/', { replace: true });
  };

  const since = auth.profile?.created_at || auth.user?.created_at;

  return (
    <>
      <div className="app-top">
        <div>
          <h1>{s.title}</h1>
          <p>{s.sub}</p>
        </div>
        <button type="button" className="btn btn-quiet btn-sm" onClick={signOut}>{s.signOut}</button>
      </div>

      <section className="panel" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        <span className="avatar" style={{ width: 64, height: 64, fontSize: 22, background: 'var(--rainbow)', color: '#fff' }}>{initials(form.full_name || auth.user?.email)}</span>
        <div className="grow" style={{ minWidth: 200 }}>
          <div style={{ fontWeight: 600, fontSize: 20 }}>{auth.profile?.full_name || '—'}</div>
          <div className="muted truncate">{auth.user?.email}</div>
          {since && <div className="muted small">{s.memberSince} {new Date(since).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
        </div>
      </section>

      <form className="panel stack" onSubmit={save} noValidate>
        <h2>{s.account}</h2>
        <label className="field">{s.email}
          <input className="input" value={auth.user?.email || ''} readOnly disabled style={{ background: 'var(--surface)', color: 'var(--muted)' }} />
        </label>
        <div className="grid-2">
          <label className="field">{s.fullName}
            <input className="input" autoComplete="name" value={form.full_name} onChange={set('full_name')} aria-invalid={!!err && !form.full_name.trim()} />
          </label>
          <label className="field">{s.salonName}
            <input className="input" autoComplete="organization" value={form.salon_name} onChange={set('salon_name')} />
          </label>
        </div>
        <div className="grid-2">
          <label className="field">{s.phone}
            <input className="input" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone', fmtPhone)} placeholder="(561) 555-0123" />
          </label>
          <label className="field">{s.city}
            <input className="input" value={form.city} onChange={set('city')} placeholder="Delray Beach, FL" />
          </label>
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{s.language}</legend>
          <div className="seg block" style={{ maxWidth: 420 }}>
            <button type="button" aria-pressed={form.preferred_language === 'en'} onClick={() => setForm((f) => ({ ...f, preferred_language: 'en' }))}>English</button>
            <button type="button" aria-pressed={form.preferred_language === 'vi'} onClick={() => setForm((f) => ({ ...f, preferred_language: 'vi' }))}>Tiếng Việt</button>
          </div>
        </fieldset>
        {store.salon && !store.sample && (
          <label className="check"><input type="checkbox" checked={syncSalon} onChange={(e) => setSyncSalon(e.target.checked)} /><span>{s.useForSalon}</span></label>
        )}
        {err && <p className="err" role="alert">{err}</p>}
        <div className="hstack">
          <button type="submit" className="btn btn-primary" disabled={!dirty || status === 'loading'}>{status === 'loading' ? s.saving : s.save}</button>
        </div>
      </form>

      <form className="panel stack" onSubmit={changePassword} noValidate>
        <h2>{s.passwordTitle}</h2>
        <div className="grid-2">
          <label className="field">{s.newPassword}
            <input className="input" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value, err: '' }))} />
          </label>
          <label className="field">{s.confirmPassword}
            <input className="input" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value, err: '' }))} />
          </label>
        </div>
        {pw.err && <p className="err" role="alert">{pw.err}</p>}
        <div className="hstack">
          <button type="submit" className="btn btn-outline" disabled={!pw.next || pw.status === 'loading'}>{pw.status === 'loading' ? s.saving : s.changePassword}</button>
        </div>
      </form>
    </>
  );
}
