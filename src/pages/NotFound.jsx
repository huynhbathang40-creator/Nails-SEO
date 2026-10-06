import { Link } from 'react-router-dom';
import { Logo } from '../components/Icons.jsx';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--surface)' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Logo />
        <h1 className="serif" style={{ margin: 0, fontSize: 40 }}>Page not found</h1>
        <p className="muted" style={{ margin: 0 }}>That page doesn't exist. Let's get you back.</p>
        <div className="hstack" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">Home</Link>
          <Link to="/app" className="btn btn-outline">Salon dashboard</Link>
        </div>
      </div>
    </main>
  );
}
