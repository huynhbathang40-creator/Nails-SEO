import { createClient } from '@supabase/supabase-js';

// Supabase project "glowback". The publishable key is meant to be public:
// row-level security in the database keeps each user's data private.
// Override with VITE_SUPABASE_URL / VITE_SUPABASE_KEY to point at another project.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://oikijxuckkwkcmcjkewb.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_pkfb6WZgqRP8LbhvNlI8_w_hKC_OZN4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
