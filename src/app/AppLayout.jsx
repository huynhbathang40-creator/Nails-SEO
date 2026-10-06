import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Back, Edit, Gear, Home, Logo, StarLine, Users } from '../components/Icons.jsx';
import { useLang } from '../lib/i18n.jsx';
import { clientStatus, useStore } from '../lib/store.jsx';
import { useS } from './ui.jsx';

const NAV = [
  ['home', '/app', Home, true],
  ['clients', '/app/clients', Users],
  ['reviews', '/app/reviews', StarLine],
  ['templates', '/app/templates', Edit],
  ['settings', '/app/settings', Gear],
];

function LangSeg() {
  const { lang, setLang } = useLang();
  return (
    <div className="seg" role="group" aria-label="Language">
      <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
      <button type="button" aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>VI</button>
    </div>
  );
}

export default function AppLayout() {
  const s = useS();
  const store = useStore();
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState('');
  const timer = useRef(0);

  const toast = useCallback((msg) => {
    clearTimeout(timer.current);
    setToastMsg(msg);
    timer.current = setTimeout(() => setToastMsg(''), 2200);
  }, []);

  const badges = useMemo(() => {
    if (!store.salon) return {};
    const todo = store.clients.filter((c) => ['review', 'winback'].includes(clientStatus(c, store.salon))).length;
    const unreplied = store.reviews.filter((r) => !r.replied).length;
    return { home: todo, reviews: unreplied };
  }, [store.clients, store.reviews, store.salon]);

  if (!store.salon) return <Navigate to="/app/setup" replace />;

  return (
    <div className="app">
      <aside className="app-side">
        <Link to="/" style={{ textDecoration: 'none', padding: '4px 10px 18px' }}><Logo size={32} fontSize={24} /></Link>
        <div style={{ padding: '0 12px 14px' }}>
          <div className="truncate" style={{ fontWeight: 600 }}>{store.salon.name}</div>
          <div className="muted small">{s.savedLocal}</div>
        </div>
        <nav className="app-nav" aria-label="App" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(([k, to, Icon, end]) => (
            <NavLink key={k} to={to} end={end}>
              <Icon />{s.navLong[k]}{badges[k] > 0 && <span className="badge">{badges[k]}</span>}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '0 8px' }}>
          <LangSeg />
          <Link to="/" className="muted small" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}><Back size={14} />{s.backToSite}</Link>
        </div>
      </aside>

      <header className="app-mobile-top">
        <Link to="/app" style={{ textDecoration: 'none', minWidth: 0 }}><Logo size={28} fontSize={20} /></Link>
        <LangSeg />
      </header>

      <main className="app-main">
        <div className="app-inner">
          {store.sample && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: '#FFF8E6', border: '1px solid #FDE7A9', borderRadius: 22, padding: '12px 18px', fontSize: 14 }}>
              <span>{s.sampleBanner}</span>
              <button type="button" className="btn btn-primary btn-xs" onClick={() => { store.resetAll(); navigate('/app/setup'); }}>{s.startFresh}</button>
            </div>
          )}
          <Outlet context={{ toast }} />
        </div>
      </main>

      <nav className="app-tabbar" aria-label="App">
        {NAV.map(([k, to, Icon, end]) => (
          <NavLink key={k} to={to} end={end}>
            <Icon size={22} />{s.nav[k]}{badges[k] > 0 && <span className="dot" aria-label={`${badges[k]} to do`} />}
          </NavLink>
        ))}
      </nav>

      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </div>
  );
}
