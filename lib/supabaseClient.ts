import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');
export const isSupabaseConfigured = !!(url && url.length > 20);