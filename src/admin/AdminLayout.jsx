import { useCallback, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Back, Home, Logo, Shield, StarLine, Users } from '../components/Icons.jsx';
import { Avatar } from '../app/Avatar.jsx';
import { useAuth } from '../lib/auth.jsx';
import { ROLE_LABEL } from './api.js';

const NAV = [
  ['Overview', '/admin', Home, true],
  ['Users', '/admin/users', Users],
  ['Activity log', '/admin/activity', StarLine],
];

export default function AdminLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState('');
  const timer = useRef(0);
  const toast = useCallback((msg) => {
    clearTimeout(timer.current);
    setToastMsg(msg);
    timer.current = setTimeout(() => setToastMsg(''), 2600);
  }, []);

  return (
    <div className="app">
      <aside className="app-side">
        <Link to="/admin" style={{ textDecoration: 'none', padding: '4px 10px 8px' }}><Logo size={32} fontSize={24} /></Link>
        <div style={{ padding: '0 10px 14px' }}><span className="admin-badge"><Shield size={14} color="#FFD166" />Admin area</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 14px' }}>
          <Avatar url={auth.profile?.avatar_url} name={auth.profile?.full_name || auth.user?.email} size={40} />
          <div style={{ minWidth: 0 }}>
            <div className="truncate" style={{ fontWeight: 600 }}>{auth.profile?.full_name || auth.user?.email}</div>
            <div className="muted small">{ROLE_LABEL[auth.role]}</div>
          </div>
        </div>
        <nav className="app-nav" aria-label="Admin" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(([label, to, Icon, end]) => <NavLink key={to} to={to} end={end}><Icon />{label}</NavLink>)}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '0 8px' }}>
          <Link to="/app" className="btn btn-quiet btn-sm"><Back size={16} />My dashboard</Link>
          <button type="button" className="btn btn-quiet btn-sm" onClick={async () => { await auth.signOut(); navigate('/', { replace: true }); }}>Sign out</button>
        </div>
      </aside>

      <header className="app-mobile-top">
        <Link to="/admin" style={{ textDecoration: 'none', minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Logo size={28} text={false} /><span className="admin-badge">Admin</span></Link>
        <Link to="/app" className="btn btn-quiet btn-xs"><Back size={14} />App</Link>
      </header>

      <main className="app-main">
        <div className="app-inner">
          {auth.role === 'employee' && (
            <div style={{ background: '#E0EDFF', color: '#1E3A8A', borderRadius: 22, padding: '12px 18px', fontSize: 14 }}>
              You're signed in as an <strong>employee</strong>: you can view everything here, but only administrators can make changes.
            </div>
          )}
          <Outlet context={{ toast }} />
        </div>
      </main>

      <nav className="app-tabbar" aria-label="Admin">
        {NAV.map(([label, to, Icon, end]) => <NavLink key={to} to={to} end={end}><Icon size={22} />{label.split(' ')[0]}</NavLink>)}
      </nav>
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </div>
  );
}
