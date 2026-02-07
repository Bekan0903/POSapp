
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = 'https://dtvvbzbosutqhruhiaqc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__nhZnjZqhCi3cqxoN79UiQ_2rDk3Tkn';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Table Helpers
export const TABLES = {
  MEDICINES: 'medicines',
  SALES: 'sales',
  PURCHASES: 'purchases',
  PROFILES: 'profiles',
  NOTIFICATIONS: 'notifications'
};
