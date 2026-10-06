import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Landing from './landing/Landing.jsx';
import Legal from './pages/Legal.jsx';
import NotFound from './pages/NotFound.jsx';
import AppLayout from './app/AppLayout.jsx';
import Dashboard from './app/Dashboard.jsx';
import Clients from './app/Clients.jsx';
import Reviews from './app/Reviews.jsx';
import Templates from './app/Templates.jsx';
import Settings from './app/Settings.jsx';
import CreateProfile from './app/CreateProfile.jsx';
import Profile from './app/Profile.jsx';
import RequireAuth from './app/RequireAuth.jsx';
import Login from './pages/Login.jsx';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<Legal page="privacy" />} />
        <Route path="/terms" element={<Legal page="terms" />} />
        <Route path="/sms-terms" element={<Legal page="sms" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Navigate to="/login?mode=signup" replace />} />
        <Route element={<RequireAuth />}>
          <Route path="/app/create-profile" element={<CreateProfile />} />
          <Route path="/app/setup" element={<Navigate to="/app/create-profile" replace />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="templates" element={<Templates />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
