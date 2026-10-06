import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase.js';

const AuthContext = createContext(null);

export const PROFILE_FIELDS = 'id, email, full_name, salon_name, phone, city, preferred_language, bio, avatar_url, google_review_link, booking_link, completed_at, created_at, updated_at';

// Fields a user may write. id/email/created_at are set once and protected by the database.
const EDITABLE = ['full_name', 'salon_name', 'phone', 'city', 'preferred_language', 'bio', 'avatar_url', 'google_review_link', 'booking_link'];
const pickEditable = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => EDITABLE.includes(k)));

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  // 'idle' (signed out) | 'loading' | 'missing' (signed in, no profile yet) | 'ready'
  const [profileStatus, setProfileStatus] = useState('idle');
  const [loading, setLoading] = useState(true);
  const user = session?.user ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = user?.id;
  const loadProfile = useCallback(async () => {
    if (!userId) { setProfile(null); setProfileStatus('idle'); return null; }
    setProfileStatus('loading');
    const { data, error } = await supabase.from('profiles').select(PROFILE_FIELDS).eq('id', userId).maybeSingle();
    if (error) { setProfileStatus('missing'); throw error; }
    setProfile(data);
    setProfileStatus(data && data.completed_at ? 'ready' : 'missing');
    return data;
  }, [userId]);

  useEffect(() => {
    loadProfile().catch((e) => console.error('Could not load profile', e));
  }, [loadProfile]);

  const value = useMemo(() => ({
    session,
    user,
    profile,
    profileStatus,
    loading: loading || (!!user && (profileStatus === 'idle' || profileStatus === 'loading') && !profile),
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    },
    // Returns { needsConfirmation: true } when Supabase requires the user to confirm their email first.
    async signUp(email, password, meta = {}) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: meta, emailRedirectTo: `${window.location.origin}/app` },
      });
      if (error) throw error;
      if (data.user && data.user.identities?.length === 0) {
        const e = new Error('User already registered');
        e.code = 'user_already_exists';
        throw e;
      }
      return { needsConfirmation: !data.session };
    },
    async signOut() {
      await supabase.auth.signOut();
      setProfile(null);
      setProfileStatus('idle');
    },
    // The user creates their own profile (or finishes one that already exists).
    async createProfile(fields) {
      const row = { ...pickEditable(fields), completed_at: new Date().toISOString() };
      const query = profile
        ? supabase.from('profiles').update(row).eq('id', user.id)
        : supabase.from('profiles').insert({ ...row, id: user.id, email: user.email });
      const { data, error } = await query.select(PROFILE_FIELDS).single();
      if (error) throw error;
      setProfile(data);
      setProfileStatus('ready');
      return data;
    },
    async updateProfile(patch) {
      const { data, error } = await supabase.from('profiles').update(pickEditable(patch)).eq('id', user.id).select(PROFILE_FIELDS).single();
      if (error) throw error;
      setProfile(data);
      return data;
    },
    // Uploads a profile photo to Storage (avatars/<user id>/...) and returns its public URL.
    async uploadAvatar(file) {
      if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
      if (file.size > 2 * 1024 * 1024) throw new Error('Please choose an image under 2 MB.');
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type, upsert: true, cacheControl: '3600' });
      if (error) throw error;
      return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    },
    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    reloadProfile: loadProfile,
  }), [session, user, profile, profileStatus, loading, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// Friendly wording for the errors people actually hit.
export function authErrorMessage(error, lang = 'en') {
  const msg = (error?.message || '').toLowerCase();
  const code = error?.code || '';
  const vi = lang === 'vi';
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials'))
    return vi ? 'Email hoặc mật khẩu không đúng.' : 'Wrong email or password.';
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed'))
    return vi ? 'Vui lòng xác nhận email trước (kiểm tra hộp thư).' : 'Please confirm your email first (check your inbox).';
  if (code === 'user_already_exists' || msg.includes('already registered'))
    return vi ? 'Email này đã có tài khoản. Hãy đăng nhập.' : 'This email already has an account. Please sign in.';
  if (code === 'weak_password' || msg.includes('password should be'))
    return vi ? 'Mật khẩu cần ít nhất 6 ký tự.' : 'Password must be at least 6 characters.';
  if (code === 'over_email_send_rate_limit' || msg.includes('rate limit'))
    return vi ? 'Quá nhiều lần thử. Vui lòng đợi vài phút.' : 'Too many attempts. Please wait a few minutes and try again.';
  if (code === 'email_address_invalid' || msg.includes('invalid format') || msg.includes('is invalid'))
    return vi ? 'Email không hợp lệ.' : 'That email address looks invalid.';
  if (msg.includes('failed to fetch') || msg.includes('network'))
    return vi ? 'Không kết nối được. Kiểm tra mạng và thử lại.' : "Couldn't connect. Check your internet and try again.";
  return error?.message || (vi ? 'Đã có lỗi. Vui lòng thử lại.' : 'Something went wrong. Please try again.');
}
