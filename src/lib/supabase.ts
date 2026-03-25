import { createClient } from '@supabase/supabase-js';

// Using credentials from elvisiongroup config as requested/found
const SUPABASE_URL = "https://nlrgdhpmsittuwiiindq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
    }
});
