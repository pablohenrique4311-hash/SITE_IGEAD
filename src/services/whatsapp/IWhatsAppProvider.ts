import {
  WhatsAppConnectionStatus,
  WhatsAppGroupInfo,
  WhatsAppProviderType,
  WhatsAppSendResult
} from '../../types/whatsappAutomation';

export interface WhatsAppProviderConfig {
  endpoint?: string;
  instanceName?: string;
  apiKey?: string;
  token?: string;
}

export interface IWhatsAppProvider {
  readonly id: WhatsAppProviderType;
  readonly name: string;
  readonly isSimulation: boolean;

  /**
   * Conecta a instância ao WhatsApp (ou inicializa a sessão)
   */
  connect(config?: WhatsAppProviderConfig): Promise<{ success: boolean; qrCode?: string; message: string }>;

  /**
   * Retorna o status atual de conexão do WhatsApp Business
   */
  getConnectionStatus(config?: WhatsAppProviderConfig): Promise<WhatsAppConnectionStatus>;

  /**
   * Lista todos os grupos existentes dos quais o número da igreja já faz parte
   */
  getGroups(config?: WhatsAppProviderConfig): Promise<WhatsAppGroupInfo[]>;

  /**
   * Envia uma mensagem de texto diretamente para o grupo existente pelo seu ID (JID)
   */
  sendGroupMessage(groupId: string, messageText: string, config?: WhatsAppProviderConfig): Promise<WhatsAppSendResult>;

  /**
   * Desconecta a sessão do WhatsApp de forma limpa
   */
  disconnect(config?: WhatsAppProviderConfig): Promise<{ success: boolean; message: string }>;
}
