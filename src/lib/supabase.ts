import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  import.meta.env.VITE_SUPABASE_URL ||
  'https://funbtudlvyvxweduqzrm.supabase.co';

const supabaseAnonKey =
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_pFNBEndgp55azbQQ1Lkbyw_r8QcA1LE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
