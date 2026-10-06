import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Icons.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useLang } from '../lib/i18n.jsx';
import { DEFAULT_SALON, useStore } from '../lib/store.jsx';
import SalonFields from './SalonFields.jsx';
import { useS } from './ui.jsx';

// First-run screen: create the salon profile, or explore with sample data.
export default function Setup() {
  const s = useS();
  const { lang, setLang } = useLang();
  const store = useStore();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const fromProfile = (p) => (p ? {
    name: p.salon_name || '',
    owner: p.full_name || '',
    phone: p.phone || '',
    city: p.city || '',
    email: p.email || '',
    textLanguage: p.preferred_language === 'vi' ? 'vi' : 'en',
  } : {});
  const [draft, setDraft] = useState(() => ({ ...DEFAULT_SALON, textLanguage: lang, ...fromProfile(profile), ...(store.sample ? {} : store.salon) }));
  const [prefilled, setPrefilled] = useState(!!profile);
  // The profile loads a moment after sign-in; fill the form once it arrives.
  useEffect(() => {
    if (profile && !prefilled) {
      setDraft((d) => ({ ...d, ...Object.fromEntries(Object.entries(fromProfile(profile)).filter(([k, v]) => v && !d[k])) }));
      setPrefilled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);
  const [err, setErr] = useState({});

  const save = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return setErr({ name: s.nameErr });
    if (store.sample) store.resetAll();
    store.setupSalon({ ...draft, name: draft.name.trim() });
    navigate('/app');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg,#F6F3F8 0%,#FDEBEF 60%,#FFF4E8 100%)', padding: '24px 16px 64px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ textDecoration: 'none' }}><Logo size={32} fontSize={24} /></Link>
          <div className="seg" role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
            <button type="button" aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>VI</button>
          </div>
        </div>
        <form className="dialog" style={{ width: '100%', animation: 'none' }} onSubmit={save} noValidate>
          <div className="rainbow-bar" />
          <div className="dialog-body">
            <div>
              <h2 style={{ fontSize: 'clamp(28px,4vw,36px)' }}>{s.setupTitle}</h2>
              <p className="muted" style={{ margin: '4px 0 0' }}>{s.setupSub}</p>
            </div>
            <SalonFields value={draft} onChange={(p) => { setDraft((d) => ({ ...d, ...p })); setErr({}); }} errors={err} compact />
            <button type="submit" className="btn btn-primary btn-block" style={{ height: 56 }}>{s.setupSave}</button>
            <button type="button" className="link-btn" style={{ alignSelf: 'center' }} onClick={() => { store.loadSample(); navigate('/app'); }}>{s.trySample} →</button>
          </div>
        </form>
      </div>
    </div>
  );
}
