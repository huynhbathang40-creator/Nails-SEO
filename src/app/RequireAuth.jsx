import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Logo } from '../components/Icons.jsx';
import { useAuth } from '../lib/auth.jsx';
import { storageKeyFor, StoreProvider } from '../lib/store.jsx';

// Gate for /app: signed-out visitors go to /login, then come back here.
export default function RequireAuth() {
  const { user, loading, profileStatus } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--surface)' }}>
        <Logo />
      </div>
    );
  }
  if (!user) {
    const next = location.pathname + location.search;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  // Signed in but no profile yet: create one first.
  if (profileStatus === 'missing' && location.pathname !== '/app/create-profile') {
    return <Navigate to="/app/create-profile" replace />;
  }
  // Each account gets its own salon data.
  return (
    <StoreProvider key={user.id} storageKey={storageKeyFor(user.id)}>
      <Outlet />
    </StoreProvider>
  );
}
