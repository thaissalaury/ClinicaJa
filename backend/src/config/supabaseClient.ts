import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

const hasPlaceholderValue = (value?: string) => {
  if (!value) {
    return true;
  }

  return /SEU_|YOUR_|changeme|example/i.test(value);
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !hasPlaceholderValue(supabaseUrl) &&
  !hasPlaceholderValue(supabaseAnonKey)
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
