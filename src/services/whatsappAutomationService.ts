/**
 * Serviço de Orquestração da Automação da Palavra do Dia no WhatsApp — IGEAD-MT
 * Gerencia configurações, fila, histórico, agendamentos no fuso America/Cuiaba e envio.
 */

import { supabase } from '../lib/supabaseClient';
import {
  WhatsAppAutomationSettings,
  WhatsAppConnectionStatus,
  WhatsAppGroupInfo,
  WhatsAppMessageHistoryItem,
  WhatsAppMessageQueueItem,
  WhatsAppSendResult
} from '../types/whatsappAutomation';
import { formatWhatsAppDailyMessage, getCuiabaDateString, getDailyWord } from './dailyWordService';
import { WhatsAppProviderConfig } from './whatsapp/IWhatsAppProvider';
import { WhatsAppProviderFactory } from './whatsapp/WhatsAppProviderFactory';
import { AUTHORIZED_WHATSAPP_ADMIN_EMAIL, isAuthorizedWhatsAppAdmin } from '../constants/authConfig';

const SETTINGS_KEY = 'igead_whatsapp_automation_settings';
const QUEUE_KEY = 'igead_whatsapp_message_queue';
const HISTORY_KEY = 'igead_whatsapp_message_history';

/**
 * Verifica se o usuário atualmente autenticado no Supabase é o administrador autorizado.
 */
async function checkIsAuthorizedAdmin(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email;
    return isAuthorizedWhatsAppAdmin(email);
  } catch {
    return false;
  }
}

/**
 * Assegura que a operação é permitida apenas para o e-mail autorizado.
 */
async function assertAuthorizedAdmin(operationName: string): Promise<void> {
  const isAuthorized = await checkIsAuthorizedAdmin();
  if (!isAuthorized) {
    throw new Error(
      `Acesso não autorizado: ${operationName} é restrito exclusivamente ao administrador oficial (${AUTHORIZED_WHATSAPP_ADMIN_EMAIL}).`
    );
  }
}

export const DEFAULT_SETTINGS: WhatsAppAutomationSettings = {
  id: 'default',
  isEnabled: false,
  scheduledTime: '07:00',
  timezone: 'America/Cuiaba',
  targetGroupId: '120363361678530962@g.us',
  targetGroupName: 'IGEAD-MT • Grupo Oficial da Igreja',
  providerType: 'greenapi',
  providerEndpoint: (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_GREEN_API_URL || 'https://7107.api.greenapi.com',
  providerInstanceName: (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_GREEN_API_INSTANCE_ID || '710722790899',
  providerApiKey: (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_GREEN_API_TOKEN || 'dcdbfe8720b844619359f2ecf8138491768d407aace44835b8',
  providerToken: (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_GREEN_API_TOKEN || 'dcdbfe8720b844619359f2ecf8138491768d407aace44835b8',
  lastSentAt: null,
  lastError: null,
  updatedAt: new Date().toISOString()
};

class WhatsAppAutomationService {
  /**
   * Recupera as configurações da automação (Supabase com fallback para localStorage)
   * Usuários não autorizados recebem configurações neutras sem credenciais.
   */
  async getSettings(): Promise<WhatsAppAutomationSettings> {
    const isAuthorized = await checkIsAuthorizedAdmin();
    if (!isAuthorized) {
      return DEFAULT_SETTINGS;
    }

    try {
      const { data, error } = await supabase
        .from('whatsapp_automation_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!error && data) {
        const mapped: WhatsAppAutomationSettings = {
          id: data.id || 'default',
          isEnabled: Boolean(data.is_enabled),
          scheduledTime: data.scheduled_time || '07:00',
          timezone: data.timezone || 'America/Cuiaba',
          targetGroupId: data.target_group_id || DEFAULT_SETTINGS.targetGroupId,
          targetGroupName: data.target_group_name || DEFAULT_SETTINGS.targetGroupName,
          providerType: data.provider_type || 'simulation',
          providerEndpoint: data.provider_endpoint,
          providerInstanceName: data.provider_instance_name,
          providerApiKey: data.provider_api_key,
          providerToken: data.provider_token,
          lastSentAt: data.last_sent_at,
          lastError: data.last_error,
          updatedAt: data.updated_at || new Date().toISOString()
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch {
      // Falha no Supabase: continua para localStorage
    }

    try {
      const local = localStorage.getItem(SETTINGS_KEY);
      if (local) return JSON.parse(local);
    } catch {
      // Ignora erro
    }

    return DEFAULT_SETTINGS;
  }

  /**
   * Salva as configurações no Supabase e no localStorage
   */
  async saveSettings(settings: WhatsAppAutomationSettings): Promise<{ success: boolean; error?: string }> {
    await assertAuthorizedAdmin('salvar configurações da automação');

    const payload = {
      id: 'default',
      is_enabled: settings.isEnabled,
      scheduled_time: settings.scheduledTime,
      timezone: settings.timezone,
      target_group_id: settings.targetGroupId,
      target_group_name: settings.targetGroupName,
      provider_type: settings.providerType,
      provider_endpoint: settings.providerEndpoint,
      provider_instance_name: settings.providerInstanceName,
      provider_api_key: settings.providerApiKey,
      provider_token: settings.providerToken,
      last_sent_at: settings.lastSentAt,
      last_error: settings.lastError,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    try {
      const { error } = await supabase.from('whatsapp_automation_settings').upsert(payload);
      if (error) {
        console.warn('[WhatsApp Automation] Aviso ao sincronizar com Supabase:', error.message);
      }
      return { success: true };
    } catch (err) {
      console.warn('[WhatsApp Automation] Exceção ao salvar no Supabase:', err);
      return { success: true };
    }
  }

  /**
   * Constrói o objeto de configuração de credenciais para o provedor ativo
   */
  private getProviderConfig(settings: WhatsAppAutomationSettings): WhatsAppProviderConfig {
    return {
      endpoint: settings.providerEndpoint,
      instanceName: settings.providerInstanceName,
      apiKey: settings.providerApiKey,
      token: settings.providerToken
    };
  }

  /**
   * Retorna o status de conexão do WhatsApp através do provedor ativo
   */
  async getConnectionStatus(): Promise<WhatsAppConnectionStatus> {
    const settings = await this.getSettings();
    const provider = WhatsAppProviderFactory.getProvider(settings.providerType);
    return provider.getConnectionStatus(this.getProviderConfig(settings));
  }

  /**
   * Obtém a lista de grupos disponíveis do WhatsApp Business
   */
  async getGroups(): Promise<WhatsAppGroupInfo[]> {
    const isAuthorized = await checkIsAuthorizedAdmin();
    if (!isAuthorized) return [];

    const settings = await this.getSettings();
    const provider = WhatsAppProviderFactory.getProvider(settings.providerType);
    return provider.getGroups(this.getProviderConfig(settings));
  }

  /**
   * Testa a conexão com o provedor de WhatsApp
   */
  async testConnection(): Promise<{ success: boolean; message: string; qrCode?: string; status: WhatsAppConnectionStatus }> {
    await assertAuthorizedAdmin('testar a conexão do WhatsApp');

    const settings = await this.getSettings();
    const provider = WhatsAppProviderFactory.getProvider(settings.providerType);
    const config = this.getProviderConfig(settings);

    const status = await provider.getConnectionStatus(config);
    if (status.state === 'connected' || status.state === 'simulated') {
      return {
        success: true,
        message: `WhatsApp conectado com sucesso (${status.phoneNumber || 'Instância ativa'}).`,
        status
      };
    }

    const connectResult = await provider.connect(config);
    const updatedStatus = await provider.getConnectionStatus(config);

    return {
      success: connectResult.success,
      message: connectResult.message,
      qrCode: connectResult.qrCode,
      status: updatedStatus
    };
  }

  /**
   * Calcula o próximo envio programado no fuso horário de Cuiabá (America/Cuiaba)
   */
  calculateNextRun(scheduledTime: string = '07:00'): { nextRunDate: Date; formattedText: string } {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);

    // Constrói horário de hoje no fuso
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    // Se já passou do horário de hoje, programa para amanhã
    if (now.getTime() >= nextRun.getTime()) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const formatted = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Cuiaba',
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(nextRun);

    return {
      nextRunDate: nextRun,
      formattedText: `${formatted} (Horário de Cuiabá - MT)`
    };
  }

  /**
   * Verifica se a Palavra do Dia já foi publicada hoje no grupo especificado (Prevenção de Duplicidade)
   */
  async isAlreadySentToday(dateStr?: string, groupId?: string): Promise<boolean> {
    const targetDate = dateStr || getCuiabaDateString();
    const settings = await this.getSettings();
    const targetGroupId = groupId || settings.targetGroupId;

    try {
      const { data, error } = await supabase
        .from('whatsapp_message_history')
        .select('id')
        .eq('daily_word_date', targetDate)
        .eq('group_id', targetGroupId)
        .eq('status', 'sent')
        .limit(1);

      if (!error && data && data.length > 0) {
        return true;
      }
    } catch {
      // Fallback
    }

    const history = this.getLocalHistory();
    return history.some(
      (h) => h.dailyWordDate === targetDate && h.groupId === targetGroupId && h.status === 'sent'
    );
  }

  /**
   * Dispara um envio de teste imediato da Palavra do Dia para o grupo configurado via Evolution API
   */
  async sendTestMessage(customTargetGroupId?: string): Promise<WhatsAppSendResult> {
    await assertAuthorizedAdmin('disparar teste imediato de mensagem');

    const settings = await this.getSettings();
    const targetGroupId = (customTargetGroupId || settings.targetGroupId || '120363361678530962@g.us').trim();

    if (!targetGroupId) {
      return {
        success: false,
        error: 'Nenhum grupo de destino configurado para o envio.'
      };
    }

    const dailyWord = await getDailyWord();
    const formattedText = formatWhatsAppDailyMessage(dailyWord);

    let result: WhatsAppSendResult = { success: false, error: 'Falha inicial no envio' };
    let handledByEdge = false;

    // 1. Tenta invocar a Edge Function do Supabase (que executa no backend com as variáveis de ambiente)
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-daily-word', {
        body: {
          isTest: true,
          targetGroupId,
          providerType: settings.providerType,
          providerEndpoint: settings.providerEndpoint,
          providerApiKey: settings.providerApiKey,
          instanceName: settings.providerInstanceName
        }
      });

      if (!error && data) {
        handledByEdge = true;
        result = {
          success: Boolean(data.success),
          providerMessageId: data.sendResult?.providerMessageId || data.providerMessageId || data.historyId,
          sentAt: new Date().toISOString(),
          error: data.success ? undefined : (data.sendResult?.error || data.error || 'Falha no envio via WhatsApp Gateway'),
          isSimulated: false
        };
      }
    } catch (edgeInvokeErr) {
      console.info('[WhatsApp Automation] Fallback para envio direto:', edgeInvokeErr);
    }

    // 2. Se a Edge Function não estava disponível no ambiente ou falhou na rede, executa o disparo direto via Provedor Ativo (GREEN-API)
    if (!handledByEdge) {
      const provider = WhatsAppProviderFactory.getProvider(settings.providerType || 'greenapi');
      const config = this.getProviderConfig(settings);

      result = await provider.sendGroupMessage(targetGroupId, formattedText, config);

      // Registra o status detalhado na tabela whatsapp_message_history
      const historyItem: WhatsAppMessageHistoryItem = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        dailyWordDate: dailyWord.date,
        groupId: targetGroupId,
        groupName: settings.targetGroupName,
        verseReference: dailyWord.reference,
        verseText: dailyWord.verseText,
        reflectionText: dailyWord.reflection,
        formattedMessage: formattedText,
        status: result.success ? 'sent' : 'failed',
        attempts: 1,
        sentAt: new Date().toISOString(),
        providerType: settings.providerType || 'greenapi',
        providerMessageId: result.providerMessageId || null,
        errorMessage: result.error || null,
        isSimulated: Boolean(result.isSimulated || provider.isSimulation)
      };

      await this.recordHistory(historyItem);
    }

    // 3. Atualiza os metadados de último envio/erro nas configurações
    if (result.success) {
      settings.lastSentAt = new Date().toISOString();
      settings.lastError = null;
      await this.saveSettings(settings);
    } else {
      settings.lastError = result.error || 'Falha no envio da mensagem de teste';
      await this.saveSettings(settings);
    }

    return result;
  }

  /**
   * Enfileira a Palavra do Dia para envio automático programado
   */
  async enqueueTodayDailyWord(): Promise<WhatsAppMessageQueueItem | null> {
    const settings = await this.getSettings();
    if (!settings.isEnabled) return null;

    const todayDate = getCuiabaDateString();

    // Previne duplicações
    const alreadySent = await this.isAlreadySentToday(todayDate, settings.targetGroupId);
    if (alreadySent) {
      console.info('[WhatsApp Automation] Palavra do dia já enviada hoje para o grupo:', todayDate);
      return null;
    }

    const dailyWord = await getDailyWord(todayDate);
    const messageText = formatWhatsAppDailyMessage(dailyWord);

    const { nextRunDate } = this.calculateNextRun(settings.scheduledTime);

    const queueItem: WhatsAppMessageQueueItem = {
      id: `queue_${todayDate}_${settings.targetGroupId.replace(/[^a-zA-Z0-9]/g, '')}`,
      dailyWordDate: todayDate,
      groupId: settings.targetGroupId,
      groupName: settings.targetGroupName,
      messageText,
      scheduledFor: nextRunDate.toISOString(),
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.saveQueueItem(queueItem);
    return queueItem;
  }

  /**
   * Processa itens pendentes na fila de mensagens
   */
  async processQueue(): Promise<{ processedCount: number; successCount: number; errors: string[] }> {
    await assertAuthorizedAdmin('processar a fila de mensagens');

    const settings = await this.getSettings();
    if (!settings.isEnabled) {
      return { processedCount: 0, successCount: 0, errors: ['Automação está pausada nas configurações.'] };
    }

    const queue = await this.getQueue();
    const pending = queue.filter((item) => item.status === 'pending');

    let successCount = 0;
    const errors: string[] = [];

    const provider = WhatsAppProviderFactory.getProvider(settings.providerType);
    const config = this.getProviderConfig(settings);

    for (const item of pending) {
      item.status = 'processing';
      item.attempts += 1;
      item.updatedAt = new Date().toISOString();
      await this.saveQueueItem(item);

      const result = await provider.sendGroupMessage(item.groupId, item.messageText, config);

      if (result.success) {
        item.status = 'sent';
        item.providerMessageId = result.providerMessageId;
        successCount++;

        // Registra histórico
        const dailyWord = await getDailyWord(item.dailyWordDate);
        const historyItem: WhatsAppMessageHistoryItem = {
          id: `hist_${Date.now()}`,
          dailyWordDate: item.dailyWordDate,
          groupId: item.groupId,
          groupName: item.groupName,
          verseReference: dailyWord.reference,
          verseText: dailyWord.verseText,
          reflectionText: dailyWord.reflection,
          formattedMessage: item.messageText,
          status: 'sent',
          attempts: item.attempts,
          sentAt: new Date().toISOString(),
          providerType: settings.providerType,
          providerMessageId: result.providerMessageId,
          isSimulated: Boolean(result.isSimulated || provider.isSimulation)
        };
        await this.recordHistory(historyItem);
      } else {
        item.lastError = result.error || 'Falha no envio do provedor';
        errors.push(`Falha no envio para ${item.groupName}: ${item.lastError}`);

        if (item.attempts >= item.maxAttempts) {
          item.status = 'failed';
        } else {
          item.status = 'pending'; // Tenta novamente no próximo ciclo
        }
      }

      await this.saveQueueItem(item);
    }

    return {
      processedCount: pending.length,
      successCount,
      errors
    };
  }

  /**
   * Salva item na fila (Supabase e Local)
   */
  private async saveQueueItem(item: WhatsAppMessageQueueItem) {
    try {
      await supabase.from('whatsapp_message_queue').upsert({
        id: item.id,
        daily_word_date: item.dailyWordDate,
        group_id: item.groupId,
        group_name: item.groupName,
        message_text: item.messageText,
        scheduled_for: item.scheduledFor,
        status: item.status,
        attempts: item.attempts,
        max_attempts: item.maxAttempts,
        last_error: item.lastError,
        provider_message_id: item.providerMessageId,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      });
    } catch {
      // Fallback
    }

    const localQueue = this.getLocalQueue();
    const idx = localQueue.findIndex((q) => q.id === item.id);
    if (idx >= 0) {
      localQueue[idx] = item;
    } else {
      localQueue.unshift(item);
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(localQueue.slice(0, 50)));
  }

  /**
   * Obtém a fila de mensagens
   */
  async getQueue(): Promise<WhatsAppMessageQueueItem[]> {
    const isAuthorized = await checkIsAuthorizedAdmin();
    if (!isAuthorized) return [];

    try {
      const { data, error } = await supabase
        .from('whatsapp_message_queue')
        .select('*')
        .order('scheduled_for', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          dailyWordDate: d.daily_word_date,
          groupId: d.group_id,
          groupName: d.group_name,
          messageText: d.message_text,
          scheduledFor: d.scheduled_for,
          status: d.status,
          attempts: d.attempts || 0,
          maxAttempts: d.max_attempts || 3,
          lastError: d.last_error,
          providerMessageId: d.provider_message_id,
          createdAt: d.created_at,
          updatedAt: d.updated_at
        }));
      }
    } catch {
      // Fallback
    }

    return this.getLocalQueue();
  }

  /**
   * Registra um item no histórico de mensagens enviadas
   */
  async recordHistory(item: WhatsAppMessageHistoryItem): Promise<void> {
    try {
      await supabase.from('whatsapp_message_history').insert({
        id: item.id,
        daily_word_date: item.dailyWordDate,
        group_id: item.groupId,
        group_name: item.groupName,
        verse_reference: item.verseReference,
        verse_text: item.verseText,
        reflection_text: item.reflectionText,
        formatted_message: item.formattedMessage,
        status: item.status,
        attempts: item.attempts,
        sent_at: item.sentAt,
        provider_type: item.providerType,
        provider_message_id: item.providerMessageId,
        error_message: item.errorMessage,
        is_simulated: item.isSimulated
      });
    } catch {
      // Fallback
    }

    const local = this.getLocalHistory();
    local.unshift(item);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(local.slice(0, 100)));
  }

  /**
   * Obtém o histórico de mensagens enviadas
   */
  async getHistory(): Promise<WhatsAppMessageHistoryItem[]> {
    const isAuthorized = await checkIsAuthorizedAdmin();
    if (!isAuthorized) return [];

    try {
      const { data, error } = await supabase
        .from('whatsapp_message_history')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          dailyWordDate: d.daily_word_date,
          groupId: d.group_id,
          groupName: d.group_name,
          verseReference: d.verse_reference,
          verseText: d.verse_text,
          reflectionText: d.reflection_text,
          formattedMessage: d.formatted_message,
          status: d.status,
          attempts: d.attempts || 1,
          sentAt: d.sent_at,
          providerType: d.provider_type || 'simulation',
          providerMessageId: d.provider_message_id,
          errorMessage: d.error_message,
          isSimulated: Boolean(d.is_simulated)
        }));
      }
    } catch {
      // Fallback
    }

    return this.getLocalHistory();
  }

  private getLocalQueue(): WhatsAppMessageQueueItem[] {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private getLocalHistory(): WhatsAppMessageHistoryItem[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Pausa imediatamente a automação
   */
  async pauseAutomation(): Promise<void> {
    await assertAuthorizedAdmin('pausar a automação');
    const settings = await this.getSettings();
    settings.isEnabled = false;
    await this.saveSettings(settings);
  }

  /**
   * Reativa a automação
   */
  async resumeAutomation(): Promise<void> {
    await assertAuthorizedAdmin('reativar a automação');
    const settings = await this.getSettings();
    settings.isEnabled = true;
    await this.saveSettings(settings);
  }
}

export const whatsappAutomationService = new WhatsAppAutomationService();
