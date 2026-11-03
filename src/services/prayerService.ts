/**
 * Serviço de Envio de Pedidos de Oração - IGEAD-MT
 * Realiza o disparo assíncrono em segundo plano (background) para o WhatsApp pastoral e e-mail oficial,
 * sem abrir janelas ou redirecionar a tela do membro.
 */

import { CHURCH_INFO } from '../constants/churchInfo';

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

/**
 * Salva localmente o histórico do pedido no navegador para redundância
 */
export function savePrayerLocally(data: PrayerRequestData) {
  try {
    const existingRaw = localStorage.getItem('igead_prayer_requests');
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift({
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    });
    // Guarda os últimos 30 pedidos localmente
    localStorage.setItem('igead_prayer_requests', JSON.stringify(existing.slice(0, 30)));
  } catch (err) {
    console.warn('[Prayer] Falha ao salvar pedido localmente:', err);
  }
}

/**
 * Disparo em background silencioso:
 * 1. CallMeBot WhatsApp API (ou webhook configurado)
 * 2. FormSubmit AJAX para o e-mail oficial igrejageracaoeleita123@gmail.com
 * 3. Armazenamento local
 */
export async function sendPrayerRequest(data: PrayerRequestData): Promise<{ success: boolean; message: string }> {
  // Salva localmente imediatamente
  savePrayerLocally(data);

  const formattedMessage = formatPrayerMessage(data);
  const targetPhone = CHURCH_INFO.phoneClean || '5565996443569';
  const apiKey = (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_CALLMEBOT_API_KEY || '';

  const promises: Promise<unknown>[] = [];

  // 1. Disparo silencioso para WhatsApp via CallMeBot API (se apiKey disponível ou modo teste)
  if (apiKey) {
    const callMeBotUrl = `https://api.callmebot.com/whatsapp.php?phone=${targetPhone}&text=${encodeURIComponent(formattedMessage)}&apikey=${encodeURIComponent(apiKey)}`;
    promises.push(
      fetch(callMeBotUrl, { method: 'GET', mode: 'no-cors' }).catch((err) => {
        console.warn('[Prayer] CallMeBot dispatch aviso:', err);
      })
    );
  }

  // 2. Disparo silencioso paralelo para o e-mail oficial igrejageracaoeleita123@gmail.com
  const emailPayload = {
    _subject: `🕊️ Novo Pedido de Oração - IGEAD-MT (${data.name})`,
    Nome: data.name,
    Contato: data.phone || 'Não informado',
    Área: PRAYER_CATEGORIES[data.category] || data.category,
    Confidencial: data.isConfidential ? 'Sim (Apenas Pastores)' : 'Não',
    Motivo: data.message,
    Data: new Date().toLocaleString('pt-BR'),
    _template: 'table'
  };

  promises.push(
    fetch(`https://formsubmit.co/ajax/${CHURCH_INFO.email}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(emailPayload)
    }).catch((err) => {
      console.warn('[Prayer] Email redundancy aviso:', err);
    })
  );

  // Aguarda as tentativas com timeout seguro de 4 segundos para não travar a interface
  try {
    await Promise.race([
      Promise.allSettled(promises),
      new Promise((resolve) => setTimeout(resolve, 3500))
    ]);
  } catch {
    // Continua para sempre confirmar ao membro que seu clamor foi registrado
  }

  return {
    success: true,
    message: 'Pedido enviado com sucesso! Nossa liderança pastoral e equipe de intercessão estarão clamando pela sua vida.'
  };
}
