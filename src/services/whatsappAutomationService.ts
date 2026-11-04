import { supabase } from '../lib/supabaseClient';
import type {
  WhatsAppAutomationSettings, WhatsAppConnectionStatus, WhatsAppGroupInfo,
  WhatsAppMessageHistoryItem, WhatsAppMessageQueueItem, WhatsAppSendResult,
} from '../types/whatsappAutomation';

export const DEFAULT_SETTINGS: WhatsAppAutomationSettings = {
  id: 'default', isEnabled: false, scheduledTime: '07:00', timezone: 'America/Cuiaba',
  targetGroupId: '', targetGroupName: '', providerType: 'simulation',
  lastSentAt: null, lastError: null, updatedAt: '',
};

export const SETTINGS_COLUMNS = 'id,is_enabled,scheduled_time,timezone,target_group_id,target_group_name,provider_type,last_sent_at,last_error,updated_at';

export function settingsFromRow(row: Record<string, any>): WhatsAppAutomationSettings {
  return {
    id: row.id, isEnabled: row.is_enabled, scheduledTime: row.scheduled_time,
    timezone: row.timezone, targetGroupId: row.target_group_id,
    targetGroupName: row.target_group_name, providerType: row.provider_type,
    lastSentAt: row.last_sent_at, lastError: row.last_error, updatedAt: row.updated_at,
  };
}

export class WhatsAppAutomationService {
  constructor(private client = supabase) {}

  private async assertAdmin() {
    const { data, error } = await this.client.rpc('is_whatsapp_admin');
    if (error || data !== true) throw new Error('Acesso administrativo não confirmado.');
  }

  private async invoke<T>(action: string): Promise<T> {
    const { data, error } = await this.client.functions.invoke('whatsapp-daily-word', {
      body: { action },
    });
    if (error || !data || data.error) {
      throw new Error('Não foi possível concluir a operação. Consulte o histórico antes de repetir.');
    }
    return data as T;
  }

  async getSettings(): Promise<WhatsAppAutomationSettings> {
    await this.assertAdmin();
    const { data, error } = await this.client.from('whatsapp_automation_settings')
      .select(SETTINGS_COLUMNS).eq('id', 'default').single();
    if (error || !data) throw new Error('Não foi possível carregar as configurações.');
    return settingsFromRow(data);
  }

  async saveSettings(settings: WhatsAppAutomationSettings): Promise<{ success: boolean }> {
    await this.assertAdmin();
    // Lista explícita: nenhum segredo, erro ou metadado de envio é aceito do navegador.
    const { error } = await this.client.from('whatsapp_automation_settings').update({
      is_enabled: settings.isEnabled, scheduled_time: settings.scheduledTime,
      timezone: settings.timezone, target_group_id: settings.targetGroupId.trim(),
      target_group_name: settings.targetGroupName.trim(), provider_type: settings.providerType,
      updated_at: new Date().toISOString(),
    }).eq('id', 'default').select('id').single();
    if (error) throw new Error('Configurações não foram salvas no servidor.');
    return { success: true };
  }

  getConnectionStatus() { return this.invoke<WhatsAppConnectionStatus>('status'); }
  getGroups() { return this.invoke<WhatsAppGroupInfo[]>('groups'); }
  async testConnection() {
    const status = await this.getConnectionStatus();
    return {
      success: status.state === 'connected' || status.state === 'simulated',
      message: status.errorMessage || (status.isSimulated ? 'Modo de simulação ativo.' : 'Status consultado no servidor.'),
      status,
    };
  }
  sendTestMessage() { return this.invoke<WhatsAppSendResult>('test'); }
  processQueue() { return this.invoke<{ processedCount: number; successCount: number; errors: string[] }>('process'); }

  calculateNextRun(scheduledTime = '07:00', now = new Date()) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(scheduledTime)) throw new Error('Horário inválido.');
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Cuiaba' }).format(now);
    // Cuiabá adota UTC-4; a data é resolvida no fuso da igreja, nunca no navegador.
    let nextRun = new Date(`${date}T${scheduledTime}:00-04:00`);
    if (nextRun <= now) nextRun = new Date(nextRun.getTime() + 86400000);
    return {
      nextRunDate: nextRun,
      formattedText: `${nextRun.toLocaleString('pt-BR', { timeZone: 'America/Cuiaba', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} (Horário de Cuiabá - MT)`,
    };
  }

  async getQueue(): Promise<WhatsAppMessageQueueItem[]> {
    await this.assertAdmin();
    const { data, error } = await this.client.from('whatsapp_message_queue').select('*')
      .order('scheduled_for', { ascending: true }).limit(30);
    if (error) throw new Error('Não foi possível carregar a fila.');
    return (data || []).map((d) => ({
      id: d.id, dailyWordDate: d.daily_word_date, groupId: d.group_id, groupName: d.group_name,
      messageText: d.message_text, scheduledFor: d.scheduled_for, status: d.status,
      attempts: d.attempts, maxAttempts: d.max_attempts, lastError: d.last_error,
      providerMessageId: d.provider_message_id, createdAt: d.created_at, updatedAt: d.updated_at,
    }));
  }

  async getHistory(): Promise<WhatsAppMessageHistoryItem[]> {
    await this.assertAdmin();
    const { data, error } = await this.client.from('whatsapp_message_history').select('*')
      .order('sent_at', { ascending: false }).limit(50);
    if (error) throw new Error('Não foi possível carregar o histórico.');
    return (data || []).map((d) => ({
      id: d.id, dailyWordDate: d.daily_word_date, groupId: d.group_id, groupName: d.group_name,
      verseReference: d.verse_reference, verseText: d.verse_text, reflectionText: d.reflection_text,
      formattedMessage: d.formatted_message, status: d.status, attempts: d.attempts,
      sentAt: d.sent_at, providerType: d.provider_type, providerMessageId: d.provider_message_id,
      errorMessage: d.error_message, isSimulated: d.is_simulated,
    }));
  }
}
export const whatsappAutomationService = new WhatsAppAutomationService();
