import { supabase } from '../lib/supabaseClient';

/** A interface consulta a decisão do banco; e-mail e metadados locais não concedem acesso. */
export async function getWhatsAppAdminStatus(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_whatsapp_admin');
    return !error && data === true;
  } catch {
    return false;
  }
}
