import { Navigate, Outlet } from 'react-router-dom';
import { Logo } from '../components/Icons.jsx';
import { useAuth } from '../lib/auth.jsx';

// Only administrators and employees may open /admin.
export default function RequireStaff() {
  const { role } = useAuth();
  if (role === null) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--surface)' }}><Logo /></div>;
  }
  if (role !== 'admin' && role !== 'employee') return <Navigate to="/app" replace />;
  return <Outlet />;
}
