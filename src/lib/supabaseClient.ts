import { createClient } from '@supabase/supabase-js';

/**
 * Cliente oficial do Supabase para o projeto IGEAD-MT
 * Gerencia autenticação de membros, sessões persistentes e perfil de usuário.
 */
export const SUPABASE_URL =
  (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_SUPABASE_URL ||
  'https://qncplvrzpcbvwptprsjg.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_fwlOIYTrjRTvuI4T843tGg_pin_LEPa';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
