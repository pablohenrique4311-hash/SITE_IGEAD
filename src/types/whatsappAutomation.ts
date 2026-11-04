/**
 * Tipos e Interfaces para a Automação da Palavra do Dia no WhatsApp — IGEAD-MT
 */

export type WhatsAppProviderType = 'greenapi' | 'evolution' | 'simulation';

export type WhatsAppConnectionState = 'connected' | 'connecting' | 'disconnected' | 'simulated';

export type WhatsAppQueueStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled' | 'uncertain';

export interface WhatsAppConnectionStatus {
  state: WhatsAppConnectionState;
  phoneNumber?: string;
  instanceName?: string;
  batteryLevel?: number;
  isSimulated: boolean;
  lastCheckedAt: string;
  errorMessage?: string;
}

export interface WhatsAppGroupInfo {
  id: string; // JID do grupo (ex: 120363xxx@g.us ou ID do Z-API)
  name: string; // Nome do grupo (ex: IGEAD-MT Grupo Oficial)
  participantsCount?: number;
  unreadCount?: number;
  isReadOnly?: boolean;
}

export interface WhatsAppSendResult {
  success: boolean;
  providerMessageId?: string;
  sentAt?: string;
  error?: string;
  isSimulated?: boolean;
}

export interface WhatsAppAutomationSettings {
  id: string;
  isEnabled: boolean;
  scheduledTime: string; // Formato HH:mm (ex: "07:00")
  timezone: string; // Padrão: "America/Cuiaba"
  targetGroupId: string;
  targetGroupName: string;
  providerType: WhatsAppProviderType;
  // Metadados
  lastSentAt?: string | null;
  lastError?: string | null;
  updatedAt: string;
}

export interface WhatsAppMessageQueueItem {
  id: string;
  dailyWordDate: string; // YYYY-MM-DD
  groupId: string;
  groupName: string;
  messageText: string;
  scheduledFor: string; // ISO string
  status: WhatsAppQueueStatus;
  attempts: number;
  maxAttempts: number;
  lastError?: string | null;
  providerMessageId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessageHistoryItem {
  id: string;
  dailyWordDate: string; // YYYY-MM-DD
  groupId: string;
  groupName: string;
  verseReference: string;
  verseText: string;
  reflectionText: string;
  formattedMessage: string;
  status: 'sent' | 'failed';
  attempts: number;
  sentAt: string;
  providerType: WhatsAppProviderType;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  isSimulated: boolean;
}
