import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Close } from '../components/Icons.jsx';
import { digits, fmtPhone, isEmail } from '../lib/calc.js';
import { submitForm } from '../lib/forms.js';
import { useStore } from '../lib/store.jsx';
import { APP_OPTS, STATION_OPTS, TIME_OPTS } from './data.js';

const PHONE_ERR = 'Please check the phone number—it should have 10 digits.';

const INITIAL = { salon: '', name: '', phone: '', email: '', city: '', stations: '4–6', app: 'Square', language: 'English', consent: false, time: 'Weekday morning' };

function Field({ label, error, ...input }) {
  return (
    <label className="field">
      {label}
      <input className="input" aria-invalid={!!error} {...input} />
      {error && <span className="err">{error}</span>}
    </label>
  );
}

export default function SignupModal({ mode, onClose }) {
  const store = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [submitErr, setSubmitErr] = useState('');
  const dialogRef = useRef(null);
  const isDemo = mode === 'demo';

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('input')?.focus();
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const set = (k) => (e) => {
    const v = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [k]: k === 'phone' ? fmtPhone(v) : v }));
    setErrors((er) => ({ ...er, [k]: null }));
  };

  const send = async (name, data) => {
    setStatus('loading');
    setSubmitErr('');
    try {
      await submitForm(name, data);
      setStatus('success');
    } catch {
      setStatus('idle');
      setSubmitErr('We couldn’t send that. Please try again, or call or text (561) 555-0123.');
    }
  };

  const submitTrial = (e) => {
    e.preventDefault();
    const er = {};
    if (step === 1) {
      if (!form.salon.trim()) er.salon = 'Please enter your salon name.';
      if (!form.name.trim()) er.name = 'Please enter your name.';
      if (digits(form.phone) !== 10) er.phone = PHONE_ERR;
      if (!isEmail(form.email)) er.email = 'Please check the email address.';
      setErrors(er);
      if (!Object.keys(er).length) setStep(2);
      return;
    }
    if (!form.city.trim()) er.city = 'Please enter your city or ZIP code.';
    if (!form.consent) er.consent = 'Please agree to receive texts so we can help you set up.';
    setErrors(er);
    if (Object.keys(er).length) return;
    const { time, ...trial } = form;
    send('trial', trial);
  };

  const submitDemo = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = 'Please enter your name.';
    if (!form.salon.trim()) er.salon = 'Please enter your salon name.';
    if (digits(form.phone) !== 10) er.phone = PHONE_ERR;
    setErrors(er);
    if (Object.keys(er).length) return;
    send('demo', { name: form.name, salon: form.salon, phone: form.phone, time: form.time, language: form.language });
  };

  const openDashboard = () => {
    if (!store.salon || store.sample) {
      if (store.sample) store.resetAll();
      store.setupSalon({ name: form.salon.trim(), owner: form.name.trim(), phone: form.phone, email: form.email.trim(), city: form.city.trim(), textLanguage: form.language === 'Tiếng Việt' ? 'vi' : 'en' });
    }
    onClose();
    navigate('/app/setup');
  };

  const success = status === 'success';
  const title = success ? (isDemo ? 'Demo requested' : "You're in!") : isDemo ? 'Book a 15-Minute Demo' : 'Start Your Free Trial';
  const sub = isDemo ? 'Phone or Zoom, in English or Vietnamese.' : step === 1 ? 'Step 1 of 2 · About you' : 'Step 2 of 2 · About your salon';
  const langToggle = (
    <div className="seg block" role="group" aria-label="Preferred language">
      <button type="button" aria-pressed={form.language === 'English'} onClick={() => set('language')('English')}>English</button>
      <button type="button" aria-pressed={form.language === 'Tiếng Việt'} onClick={() => set('language')('Tiếng Việt')}>Tiếng Việt</button>
    </div>
  );

  return (
    <div className="backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-h">
        <div className="rainbow-bar" />
        <div className="dialog-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <h2 id="modal-h">{title}</h2>
              {!success && <p style={{ margin: '4px 0 0', fontSize: 15, color: 'var(--muted)' }}>{sub}</p>}
            </div>
            <button type="button" className="icon-btn" aria-label="Close" onClick={onClose} style={{ width: 44, height: 44 }}><Close size={18} /></button>
          </div>

          {success && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '24px 0' }}>
              <span style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'grid', placeItems: 'center', animation: 'gbPop 400ms cubic-bezier(0.68,-0.55,0.265,1.55) both' }}><Check size={36} /></span>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{isDemo ? "We'll text you to confirm your demo time." : "We'll text you in the next few minutes to get set up."}</p>
              {isDemo ? (
                <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
              ) : (
                <>
                  <p className="muted" style={{ margin: 0 }}>Want to look around now? Your dashboard is ready.</p>
                  <div className="hstack" style={{ justifyContent: 'center' }}>
                    <button type="button" className="btn btn-primary" onClick={openDashboard}>Open My Dashboard</button>
                    <button type="button" className="btn btn-quiet" onClick={onClose}>Later</button>
                  </div>
                </>
              )}
            </div>
          )}

          {!success && !isDemo && (
            <>
              <div style={{ display: 'flex', gap: 6 }} aria-label={`Step ${step} of 2`}>
                <span style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--plum)' }} />
                <span style={{ flex: 1, height: 6, borderRadius: 999, background: step === 2 ? 'var(--plum)' : 'var(--line)' }} />
              </div>
              <form onSubmit={submitTrial} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {step === 1 ? (
                  <>
                    <Field label="Salon name" placeholder="Lux Nails & Spa" autoComplete="organization" value={form.salon} onChange={set('salon')} error={errors.salon} />
                    <Field label="Your name" placeholder="Linda Tran" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
                    <Field label="Mobile phone" type="tel" placeholder="(561) 555-0123" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
                    <Field label="Email" type="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
                  </>
                ) : (
                  <>
                    <Field label="City or ZIP" placeholder="Delray Beach or 33444" autoComplete="postal-code" value={form.city} onChange={set('city')} error={errors.city} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                      <label className="field">Number of stations
                        <select className="input" value={form.stations} onChange={set('stations')}>{STATION_OPTS.map((o) => <option key={o}>{o}</option>)}</select>
                      </label>
                      <label className="field">Booking app
                        <select className="input" value={form.app} onChange={set('app')}>{APP_OPTS.map((o) => <option key={o}>{o}</option>)}</select>
                      </label>
                    </div>
                    {form.stations === '11+' && <p style={{ margin: 0, fontSize: 14, color: 'var(--plum)', background: 'var(--lilac)', padding: '10px 16px', borderRadius: 16 }}>11+ stations? Our Multi-Location plan includes a dedicated setup specialist.</p>}
                    <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Preferred language</legend>
                      {langToggle}
                    </fieldset>
                    <label className="check">
                      <input type="checkbox" checked={form.consent} onChange={set('consent')} />
                      <span>I agree to receive texts from GlowBack about my account. Reply STOP anytime. See our <Link to="/privacy" target="_blank">Privacy Policy</Link> and <Link to="/sms-terms" target="_blank">SMS Terms</Link>.</span>
                    </label>
                    {errors.consent && <span className="err">{errors.consent}</span>}
                  </>
                )}
                {submitErr && <p className="err">{submitErr}</p>}
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  {step === 2 && <button type="button" className="btn btn-quiet" onClick={() => setStep(1)} style={{ height: 56, padding: '0 22px' }}>Back</button>}
                  <button type="submit" className="btn btn-primary" disabled={status === 'loading'} style={{ flex: 1, height: 56 }}>
                    {status === 'loading' ? 'Setting up…' : step === 1 ? 'Continue' : 'Start My Free Trial'}
                  </button>
                </div>
                <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>14-day free trial • No credit card • Cancel anytime</p>
              </form>
            </>
          )}

          {!success && isDemo && (
            <form onSubmit={submitDemo} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Your name" placeholder="Linda Tran" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
              <Field label="Salon name" placeholder="Lux Nails & Spa" autoComplete="organization" value={form.salon} onChange={set('salon')} error={errors.salon} />
              <Field label="Mobile phone" type="tel" placeholder="(561) 555-0123" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
              <label className="field">Best time for you
                <select className="input" value={form.time} onChange={set('time')}>{TIME_OPTS.map((o) => <option key={o}>{o}</option>)}</select>
              </label>
              {langToggle}
              {submitErr && <p className="err">{submitErr}</p>}
              <button type="submit" className="btn btn-primary" disabled={status === 'loading'} style={{ height: 56 }}>{status === 'loading' ? 'Sending…' : 'Request My Demo'}</button>
              <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>Phone or Zoom · 15 minutes · English or Tiếng Việt</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
