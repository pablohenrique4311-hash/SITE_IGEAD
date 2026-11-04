/**
 * Serviço de Envio de Pedidos de Oração - IGEAD-MT
 * Realiza o disparo assíncrono em segundo plano (background) para o WhatsApp pastoral e e-mail oficial,
 * sem abrir janelas ou redirecionar a tela do membro.
 */

import { supabase } from '../lib/supabaseClient';
import { clearLegacyPrivateStorage } from '../lib/privateStorage';

export interface PrayerRequestData {
  name: string;
  phone?: string;
  category: string;
  message: string;
  isConfidential: boolean;
}

export const PRAYER_CATEGORIES: Record<string, string> = {
  familia: 'Família e Casamento',
  saude: 'Saúde e Cura',
  espiritual: 'Libertação & Vida Espiritual',
  financeiro: 'Causas Financeiras & Emprego',
  agradecimento: 'Agradecimento por Bênção'
};

/**
 * Formata a mensagem do pedido de oração conforme especificação
 */
export function formatPrayerMessage(data: PrayerRequestData): string {
  const categoryLabel = PRAYER_CATEGORIES[data.category] || data.category || 'Geral';
  const phoneText = data.phone?.trim() ? data.phone.trim() : 'Não informado';
  const confidentialText = data.isConfidential ? 'Sim' : 'Não';

  return [
    '🕊️ *Novo Pedido de Oração - IGEAD-MT*',
    `👤 *Nome:* ${data.name.trim()}`,
    `📱 *Contato:* ${phoneText}`,
    `🎯 *Área:* ${categoryLabel}`,
    `🔒 *Confidencial:* ${confidentialText}`,
    `📝 *Motivo:* ${data.message.trim()}`
  ].join('\n');
}

/** Compatibilidade para remover registros legados; conteúdo nunca é persistido. */
export function savePrayerLocally(_data: PrayerRequestData) {
  clearLegacyPrivateStorage();
}

export async function sendPrayerRequest(data: PrayerRequestData): Promise<{ success: boolean; message: string }> {
  clearLegacyPrivateStorage();
  if (!data.name.trim() || data.name.trim().length > 120 || !data.message.trim() ||
      data.message.trim().length > 4000 || (data.phone || '').length > 30 ||
      !Object.hasOwn(PRAYER_CATEGORIES, data.category)) {
    return { success: false, message: 'Revise o nome, a categoria e o pedido (até 4000 caracteres).' };
  }
  try {
    const { data: id, error } = await supabase.rpc('submit_prayer_request', {
      p_name: data.name.trim(), p_phone: data.phone?.trim() || '',
      p_category: data.category, p_message: data.message.trim(), p_confidential: data.isConfidential,
    }).abortSignal(AbortSignal.timeout(8000));
    if (error || typeof id !== 'string') {
      return { success: false, message: 'Não foi possível confirmar o registro. Aguarde antes de tentar novamente.' };
    }
    return { success: true, message: 'Pedido recebido e registrado para consulta pastoral. Isso não confirma leitura ou entrega por WhatsApp.' };
  } catch {
    return { success: false, message: 'Não foi possível confirmar o registro. Verifique sua conexão.' };
  }
}
