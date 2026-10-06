import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase.js';

const AuthContext = createContext(null);

const PROFILE_FIELDS = 'id, email, full_name, salon_name, phone, city, preferred_language, created_at, updated_at';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
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

  const loadProfile = useCallback(async () => {
    if (!user) { setProfile(null); return null; }
    const { data, error } = await supabase.from('profiles').select(PROFILE_FIELDS).eq('id', user.id).maybeSingle();
    if (error) throw error;
    if (data) { setProfile(data); return data; }
    // Safety net: the database trigger normally creates this row at sign-up.
    const meta = user.user_metadata || {};
    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: user.id, email: user.email, full_name: meta.full_name || '', salon_name: meta.salon_name || '', preferred_language: meta.preferred_language === 'vi' ? 'vi' : 'en' })
      .select(PROFILE_FIELDS)
      .single();
    if (insertError) throw insertError;
    setProfile(created);
    return created;
  }, [user]);

  useEffect(() => {
    loadProfile().catch((e) => console.error('Could not load profile', e));
  }, [loadProfile]);

  const value = useMemo(() => ({
    session,
    user,
    profile,
    loading,
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
    },
    async updateProfile(patch) {
      const { data, error } = await supabase.from('profiles').update(patch).eq('id', user.id).select(PROFILE_FIELDS).single();
      if (error) throw error;
      setProfile(data);
      return data;
    },
    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    reloadProfile: loadProfile,
  }), [session, user, profile, loading, loadProfile]);

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
