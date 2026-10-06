import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Icons.jsx';
import { authErrorMessage, useAuth } from '../lib/auth.jsx';
import { fmtPhone } from '../lib/calc.js';
import { useLang } from '../lib/i18n.jsx';
import { salonFromProfile, useStore } from '../lib/store.jsx';
import { AvatarPicker } from './Avatar.jsx';
import { useS } from './ui.jsx';

export const isLink = (v) => !v || /^https?:\/\/\S+\.\S+/i.test(v.trim());

// First screen after sign-up: each user creates their own profile, saved in Supabase.
export default function CreateProfile() {
  const all = useS();
  const s = all.create;
  const { lang, setLang } = useLang();
  const auth = useAuth();
  const store = useStore();
  const navigate = useNavigate();
  const meta = auth.user?.user_metadata || {};
  const existing = auth.profile || {};

  const [form, setForm] = useState(() => ({
    full_name: existing.full_name || meta.full_name || '',
    phone: existing.phone || meta.phone || '',
    preferred_language: existing.preferred_language || (meta.preferred_language === 'vi' ? 'vi' : lang),
    bio: existing.bio || '',
    avatar_url: existing.avatar_url || '',
    salon_name: existing.salon_name || meta.salon_name || '',
    city: existing.city || meta.city || '',
    google_review_link: existing.google_review_link || '',
    booking_link: existing.booking_link || '',
  }));
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [submitErr, setSubmitErr] = useState('');

  if (auth.profileStatus === 'ready' && status !== 'loading') return <Navigate to="/app" replace />;

  const set = (k, fmt) => (e) => { setForm((f) => ({ ...f, [k]: fmt ? fmt(e.target.value) : e.target.value })); setErrors((x) => ({ ...x, [k]: null })); setSubmitErr(''); };

  const next = (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return setErrors({ full_name: s.nameErr });
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.salon_name.trim()) er.salon_name = s.salonErr;
    if (!isLink(form.google_review_link)) er.google_review_link = s.linkErr;
    if (!isLink(form.booking_link)) er.booking_link = s.linkErr;
    setErrors(er);
    if (Object.keys(er).length) return;

    setStatus('loading');
    try {
      const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
      const profile = await auth.createProfile(trimmed);
      if (store.sample) store.resetAll();
      store.setupSalon(salonFromProfile(profile));
      if (profile.preferred_language !== lang) setLang(profile.preferred_language);
      navigate('/app', { replace: true });
    } catch (error) {
      setSubmitErr(authErrorMessage(error, lang));
      setStatus('idle');
    }
  };

  const langToggle = (value, onPick) => (
    <div className="seg block" style={{ maxWidth: 420 }}>
      <button type="button" aria-pressed={value === 'en'} onClick={() => onPick('en')}>English</button>
      <button type="button" aria-pressed={value === 'vi'} onClick={() => onPick('vi')}>Tiếng Việt</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg,#F6F3F8 0%,#FDEBEF 60%,#FFF4E8 100%)', padding: '24px 16px 64px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ textDecoration: 'none' }}><Logo size={32} fontSize={24} /></Link>
          <div className="seg" role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
            <button type="button" aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>VI</button>
          </div>
        </div>

        <form className="dialog" style={{ width: '100%', animation: 'none' }} onSubmit={step === 1 ? next : submit} noValidate>
          <div className="rainbow-bar" />
          <div className="dialog-body">
            <div>
              <div className="eyebrow" style={{ color: 'var(--magenta)' }}>{s.step(step)} · {step === 1 ? s.aboutYou : s.yourSalon}</div>
              <h1 className="serif" style={{ margin: '4px 0 0', fontWeight: 400, fontSize: 'clamp(28px,4vw,36px)', lineHeight: 1.2 }}>{s.title}</h1>
              <p className="muted" style={{ margin: '4px 0 0' }}>{s.sub}</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
              <span style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--plum)' }} />
              <span style={{ flex: 1, height: 6, borderRadius: 999, background: step === 2 ? 'var(--plum)' : 'var(--line)' }} />
            </div>

            {step === 1 ? (
              <>
                <div className="field">{s.photo}
                  <AvatarPicker url={form.avatar_url} name={form.full_name || auth.user?.email} onChange={(url) => setForm((f) => ({ ...f, avatar_url: url }))} labels={all.avatar} />
                </div>
                <label className="field">{s.fullName}
                  <input className="input" autoComplete="name" autoFocus value={form.full_name} onChange={set('full_name')} aria-invalid={!!errors.full_name} placeholder="Linda Tran" maxLength={100} />
                  {errors.full_name && <span className="err">{errors.full_name}</span>}
                </label>
                <label className="field">{s.phone}
                  <input className="input" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone', fmtPhone)} placeholder="(561) 555-0123" />
                </label>
                <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{s.language}</legend>
                  {langToggle(form.preferred_language, (v) => setForm((f) => ({ ...f, preferred_language: v })))}
                </fieldset>
                <label className="field">{s.bio}
                  <textarea className="input" rows={3} maxLength={500} value={form.bio} onChange={set('bio')} placeholder={s.bioPh} />
                  <span className="hint" style={{ alignSelf: 'flex-end' }}>{form.bio.length}/500</span>
                </label>
                <button type="submit" className="btn btn-primary btn-block" style={{ height: 56 }}>{s.next}</button>
              </>
            ) : (
              <>
                <div className="grid-2">
                  <label className="field">{s.salonName}
                    <input className="input" autoComplete="organization" autoFocus value={form.salon_name} onChange={set('salon_name')} aria-invalid={!!errors.salon_name} placeholder="Lux Nails & Spa" maxLength={120} />
                    {errors.salon_name && <span className="err">{errors.salon_name}</span>}
                  </label>
                  <label className="field">{s.city}
                    <input className="input" value={form.city} onChange={set('city')} placeholder="Delray Beach, FL" maxLength={100} />
                  </label>
                </div>
                <label className="field">{all.googleLink}
                  <input className="input" type="url" inputMode="url" value={form.google_review_link} onChange={set('google_review_link')} aria-invalid={!!errors.google_review_link} placeholder="https://g.page/r/…/review" />
                  {errors.google_review_link ? <span className="err">{errors.google_review_link}</span> : <span className="hint">{all.googleHelp}</span>}
                </label>
                <label className="field">{all.bookingLink}
                  <input className="input" type="url" inputMode="url" value={form.booking_link} onChange={set('booking_link')} aria-invalid={!!errors.booking_link} placeholder="https://squareup.com/appointments/book/…" />
                  {errors.booking_link ? <span className="err">{errors.booking_link}</span> : <span className="hint">{all.bookingHelp}</span>}
                </label>
                {submitErr && <p className="err" role="alert">{submitErr}</p>}
                <div className="hstack">
                  <button type="button" className="btn btn-quiet" onClick={() => setStep(1)} style={{ height: 56 }}>{s.back}</button>
                  <button type="submit" className="btn btn-primary" disabled={status === 'loading'} style={{ flex: 1, height: 56 }}>{status === 'loading' ? s.creating : s.submit}</button>
                </div>
              </>
            )}

            <p className="small muted" style={{ margin: 0, textAlign: 'center' }}>
              {s.signedInAs(auth.user?.email)} ·{' '}
              <button type="button" className="link-btn" style={{ padding: 0, fontSize: 13 }} onClick={async () => { await auth.signOut(); navigate('/login', { replace: true }); }}>{s.notYou}</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
