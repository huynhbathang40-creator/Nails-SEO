import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { authErrorMessage, useAuth } from '../lib/auth.jsx';
import { fmtPhone } from '../lib/calc.js';
import { useLang } from '../lib/i18n.jsx';
import { useStore } from '../lib/store.jsx';
import { Avatar, AvatarPicker } from './Avatar.jsx';
import { isLink } from './CreateProfile.jsx';
import { useS } from './ui.jsx';

const fromProfile = (p) => ({
  avatar_url: p?.avatar_url || '',
  full_name: p?.full_name || '',
  phone: p?.phone || '',
  preferred_language: p?.preferred_language === 'vi' ? 'vi' : 'en',
  bio: p?.bio || '',
  salon_name: p?.salon_name || '',
  city: p?.city || '',
  google_review_link: p?.google_review_link || '',
  booking_link: p?.booking_link || '',
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
  const [errors, setErrors] = useState({});
  const [err, setErr] = useState('');
  const [pw, setPw] = useState({ next: '', confirm: '', status: 'idle', err: '' });

  useEffect(() => { setForm(fromProfile(auth.profile)); }, [auth.profile]);

  const set = (k, fmt) => (e) => { setForm((f) => ({ ...f, [k]: fmt ? fmt(e.target.value) : e.target.value })); setErrors((x) => ({ ...x, [k]: null })); setErr(''); };
  const dirty = JSON.stringify(form) !== JSON.stringify(fromProfile(auth.profile));

  const save = async (patch = form) => {
    const er = {};
    if (!patch.full_name.trim()) er.full_name = all.auth.nameErr;
    if (!isLink(patch.google_review_link)) er.google_review_link = s.linkErr;
    if (!isLink(patch.booking_link)) er.booking_link = s.linkErr;
    setErrors(er);
    if (Object.keys(er).length) return;
    setStatus('loading');
    try {
      const trimmed = Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
      const saved = await auth.updateProfile(trimmed);
      if (syncSalon && store.salon && !store.sample) {
        const pick = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v));
        store.updateSalon(pick({
          name: saved.salon_name, owner: saved.full_name, phone: saved.phone, city: saved.city,
          googleReviewLink: saved.google_review_link, bookingLink: saved.booking_link,
        }));
      }
      if (saved.preferred_language !== lang) setLang(saved.preferred_language);
      toast(s.saved);
    } catch (error) {
      setErr(authErrorMessage(error, lang));
    } finally {
      setStatus('idle');
    }
  };

  // A new photo is saved right away so it isn't lost if the user navigates off.
  const onAvatar = (url) => {
    const next = { ...fromProfile(auth.profile), avatar_url: url };
    setForm((f) => ({ ...f, avatar_url: url }));
    save(next);
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
        <Avatar url={auth.profile?.avatar_url} name={auth.profile?.full_name || auth.user?.email} size={72} />
        <div className="grow" style={{ minWidth: 200 }}>
          <div style={{ fontWeight: 600, fontSize: 20 }}>{auth.profile?.full_name || '—'}</div>
          <div className="muted">{[auth.profile?.salon_name, auth.profile?.city].filter(Boolean).join(' · ')}</div>
          <div className="muted small truncate">{auth.user?.email}</div>
          {since && <div className="muted small">{s.memberSince} {new Date(since).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
        </div>
        {auth.profile?.bio && <p style={{ margin: 0, flexBasis: '100%', color: 'var(--text-2)', whiteSpace: 'pre-wrap' }}>{auth.profile.bio}</p>}
      </section>

      <form className="panel stack" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
        <h2>{s.account}</h2>
        <div className="field">{s.photo}
          <AvatarPicker url={form.avatar_url} name={form.full_name || auth.user?.email} onChange={onAvatar} labels={all.avatar} />
        </div>
        <label className="field">{s.email}
          <input className="input" value={auth.user?.email || ''} readOnly disabled style={{ background: 'var(--surface)', color: 'var(--muted)' }} />
        </label>
        <div className="grid-2">
          <label className="field">{s.fullName}
            <input className="input" autoComplete="name" maxLength={100} value={form.full_name} onChange={set('full_name')} aria-invalid={!!errors.full_name} />
            {errors.full_name && <span className="err">{errors.full_name}</span>}
          </label>
          <label className="field">{s.phone}
            <input className="input" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone', fmtPhone)} placeholder="(561) 555-0123" />
          </label>
        </div>
        <label className="field">{s.bio}
          <textarea className="input" rows={3} maxLength={500} value={form.bio} onChange={set('bio')} placeholder={all.create.bioPh} />
          <span className="hint" style={{ alignSelf: 'flex-end' }}>{form.bio.length}/500</span>
        </label>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{s.language}</legend>
          <div className="seg block" style={{ maxWidth: 420 }}>
            <button type="button" aria-pressed={form.preferred_language === 'en'} onClick={() => setForm((f) => ({ ...f, preferred_language: 'en' }))}>English</button>
            <button type="button" aria-pressed={form.preferred_language === 'vi'} onClick={() => setForm((f) => ({ ...f, preferred_language: 'vi' }))}>Tiếng Việt</button>
          </div>
        </fieldset>

        <h2 style={{ marginTop: 8 }}>{s.salonSection}</h2>
        <div className="grid-2">
          <label className="field">{s.salonName}
            <input className="input" autoComplete="organization" maxLength={120} value={form.salon_name} onChange={set('salon_name')} />
          </label>
          <label className="field">{s.city}
            <input className="input" maxLength={100} value={form.city} onChange={set('city')} placeholder="Delray Beach, FL" />
          </label>
        </div>
        <label className="field">{s.googleLink}
          <input className="input" type="url" inputMode="url" value={form.google_review_link} onChange={set('google_review_link')} aria-invalid={!!errors.google_review_link} placeholder="https://g.page/r/…/review" />
          {errors.google_review_link && <span className="err">{errors.google_review_link}</span>}
        </label>
        <label className="field">{s.bookingLink}
          <input className="input" type="url" inputMode="url" value={form.booking_link} onChange={set('booking_link')} aria-invalid={!!errors.booking_link} placeholder="https://squareup.com/appointments/book/…" />
          {errors.booking_link && <span className="err">{errors.booking_link}</span>}
        </label>
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
