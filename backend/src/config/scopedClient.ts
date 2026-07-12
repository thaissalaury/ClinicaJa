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

/**
 * Cria uma instância do Supabase com o token do usuário logado.
 * Isso garante que as regras de segurança (RLS) do banco de dados sejam aplicadas corretamente
 * de acordo com o usuário que está fazendo a requisição.
 */
export const getScopedClient = (token: string) => {
  if (!supabaseUrl || !supabaseAnonKey || hasPlaceholderValue(supabaseUrl) || hasPlaceholderValue(supabaseAnonKey)) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
};
