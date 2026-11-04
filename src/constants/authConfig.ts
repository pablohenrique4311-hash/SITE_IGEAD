/**
 * Configurações de Autorização e Controle de Acesso — IGEAD-MT
 * Define o e-mail único autorizado para administração da Automação WhatsApp.
 */

export const AUTHORIZED_WHATSAPP_ADMIN_EMAIL = 'pablohenrique4311@gmail.com';

/**
 * Valida com segurança se o usuário ou e-mail fornecido é o administrador oficial da automação.
 * A comparação é estrita, normalizada (lowercase e trim) e baseada no Supabase Auth.
 */
export function isAuthorizedWhatsAppAdmin(
  userOrEmail?: { email?: string | null } | string | null
): boolean {
  if (!userOrEmail) return false;

  const email =
    typeof userOrEmail === 'string'
      ? userOrEmail
      : userOrEmail.email;

  if (!email || typeof email !== 'string') return false;

  return email.trim().toLowerCase() === AUTHORIZED_WHATSAPP_ADMIN_EMAIL.toLowerCase();
}
