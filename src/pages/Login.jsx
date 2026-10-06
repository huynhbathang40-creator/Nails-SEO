import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Logo } from '../components/Icons.jsx';
import { useS } from '../app/ui.jsx';
import { authErrorMessage, useAuth } from '../lib/auth.jsx';
import { isEmail } from '../lib/calc.js';
import { useLang } from '../lib/i18n.jsx';
import { supabase } from '../lib/supabase.js';

// Only allow redirects back into this app.
const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/app');

export default function Login() {
  const s = useS().auth;
  const { lang, setLang } = useLang();
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [form, setForm] = useState({
    email: params.get('email') || '',
    password: '',
    fullName: params.get('name') || '',
    salonName: params.get('salon') || '',
    language: params.get('lang') === 'vi' ? 'vi' : lang,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [submitErr, setSubmitErr] = useState('');
  const [sentTo, setSentTo] = useState('');

  useEffect(() => { setErrors({}); setSubmitErr(''); }, [mode]);

  if (auth.loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }} className="muted">{s.loading}</div>;
  if (auth.user && status !== 'loading') return <Navigate to={next} replace />;

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: null })); setSubmitErr(''); };
  const signup = mode === 'signup';

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!isEmail(form.email.trim())) er.email = s.emailErr;
    if (form.password.length < 6) er.password = s.passwordErr;
    if (signup && !form.fullName.trim()) er.fullName = s.nameErr;
    setErrors(er);
    if (Object.keys(er).length) return;

    setStatus('loading');
    setSubmitErr('');
    try {
      if (signup) {
        const { needsConfirmation } = await auth.signUp(form.email, form.password, {
          full_name: form.fullName.trim(),
          salon_name: form.salonName.trim(),
          preferred_language: form.language,
        });
        if (needsConfirmation) { setSentTo(form.email.trim()); setStatus('idle'); return; }
        // Details from the landing-page trial form, if the user came from there.
        const extra = { phone: params.get('phone') || '', city: params.get('city') || '' };
        if (extra.phone || extra.city) {
          const { data } = await supabase.auth.getUser();
          if (data.user) await supabase.from('profiles').update(extra).eq('id', data.user.id);
        }
      } else {
        await auth.signIn(form.email, form.password);
      }
      if (signup) setLang(form.language);
      navigate(next, { replace: true });
    } catch (err) {
      setSubmitErr(authErrorMessage(err, lang));
      setStatus('idle');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg,#F6F3F8 0%,#FDEBEF 60%,#FFF4E8 100%)', padding: '24px 16px 64px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ textDecoration: 'none' }}><Logo size={32} fontSize={24} /></Link>
          <div className="seg" role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
            <button type="button" aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>VI</button>
          </div>
        </div>

        <div className="dialog" style={{ width: '100%', animation: 'none' }}>
          <div className="rainbow-bar" />
          {sentTo ? (
            <div className="dialog-body" style={{ alignItems: 'center', textAlign: 'center' }}>
              <span style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'grid', placeItems: 'center' }}><Check size={36} /></span>
              <h1 className="serif" style={{ margin: 0, fontSize: 30, fontWeight: 400 }}>{s.checkEmailTitle}</h1>
              <p style={{ margin: 0 }}>{s.checkEmail(sentTo)}</p>
              <button type="button" className="btn btn-primary" onClick={() => { setSentTo(''); setMode('signin'); }}>{s.backToSignIn}</button>
            </div>
          ) : (
            <form className="dialog-body" onSubmit={submit} noValidate>
              <div>
                <h1 className="serif" style={{ margin: 0, fontSize: 'clamp(28px,4vw,34px)', fontWeight: 400, lineHeight: 1.2 }}>{signup ? s.signUpTitle : s.signInTitle}</h1>
                <p className="muted" style={{ margin: '4px 0 0' }}>{signup ? s.signUpSub : s.signInSub}</p>
              </div>
              <div className="seg block" role="tablist">
                <button type="button" role="tab" aria-selected={!signup} aria-pressed={!signup} onClick={() => setMode('signin')}>{s.signInTab}</button>
                <button type="button" role="tab" aria-selected={signup} aria-pressed={signup} onClick={() => setMode('signup')}>{s.signUpTab}</button>
              </div>

              {signup && (
                <>
                  <label className="field">{s.fullName}
                    <input className="input" autoComplete="name" value={form.fullName} onChange={set('fullName')} aria-invalid={!!errors.fullName} placeholder="Linda Tran" />
                    {errors.fullName && <span className="err">{errors.fullName}</span>}
                  </label>
                  <label className="field">{s.salonName}
                    <input className="input" autoComplete="organization" value={form.salonName} onChange={set('salonName')} placeholder="Lux Nails & Spa" />
                  </label>
                </>
              )}
              <label className="field">{s.email}
                <input className="input" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} aria-invalid={!!errors.email} placeholder="you@example.com" />
                {errors.email && <span className="err">{errors.email}</span>}
              </label>
              <label className="field">{s.password}
                <input className="input" type="password" autoComplete={signup ? 'new-password' : 'current-password'} value={form.password} onChange={set('password')} aria-invalid={!!errors.password} />
                {errors.password ? <span className="err">{errors.password}</span> : signup && <span className="hint">{s.passwordHint}</span>}
              </label>
              {signup && (
                <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{s.language}</legend>
                  <div className="seg block">
                    <button type="button" aria-pressed={form.language === 'en'} onClick={() => setForm((f) => ({ ...f, language: 'en' }))}>English</button>
                    <button type="button" aria-pressed={form.language === 'vi'} onClick={() => setForm((f) => ({ ...f, language: 'vi' }))}>Tiếng Việt</button>
                  </div>
                </fieldset>
              )}

              {submitErr && <p className="err" role="alert">{submitErr}</p>}
              <button type="submit" className="btn btn-primary btn-block" disabled={status === 'loading'} style={{ height: 56 }}>
                {status === 'loading' ? s.working : signup ? s.signUpBtn : s.signInBtn}
              </button>
              <p className="small muted" style={{ margin: 0, textAlign: 'center' }}>
                {signup ? s.haveAccount : s.noAccount}{' '}
                <button type="button" className="link-btn" style={{ padding: 0 }} onClick={() => setMode(signup ? 'signin' : 'signup')}>{signup ? s.signInTab : s.signUpTab}</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
