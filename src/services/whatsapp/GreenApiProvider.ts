import {
  WhatsAppConnectionStatus,
  WhatsAppGroupInfo,
  WhatsAppProviderType,
  WhatsAppSendResult
} from '../../types/whatsappAutomation';
import { IWhatsAppProvider, WhatsAppProviderConfig } from './IWhatsAppProvider';

/**
 * Provedor para GREEN-API (Gratuito / Developer)
 * Gateway oficial para automações via WhatsApp com conta Developer gratuita e suporte a grupos existentes (@g.us).
 * 
 * Especificações oficiais GREEN-API:
 * - URL de Envio: ${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}
 * - Headers: Content-Type: application/json
 * - Body: { "chatId": "120363361678530962@g.us", "message": "..." }
 * - Resposta de Sucesso: { "idMessage": "BAE5..." }
 */
export class GreenApiWhatsAppProvider implements IWhatsAppProvider {
  readonly id: WhatsAppProviderType = 'greenapi';
  readonly name = 'GREEN-API (Gratuito / Developer)';
  readonly isSimulation = false;

  private cleanEndpoint(endpoint?: string): string {
    const raw = endpoint || (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_GREEN_API_URL || 'https://7107.api.greenapi.com';
    return raw.replace(/\/+$/, '');
  }

  private cleanInstanceId(instanceName?: string): string {
    const raw = instanceName || (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_GREEN_API_INSTANCE_ID || '710722790899';
    const trimmed = raw.trim();
    return trimmed.startsWith('waInstance') ? trimmed.replace(/^waInstance/i, '') : trimmed;
  }

  private getToken(config?: WhatsAppProviderConfig): string {
    return (
      config?.token ||
      config?.apiKey ||
      (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_GREEN_API_TOKEN ||
      'dcdbfe8720b844619359f2ecf8138491768d407aace44835b8'
    ).trim();
  }

  async connect(config?: WhatsAppProviderConfig): Promise<{ success: boolean; qrCode?: string; message: string }> {
    const baseUrl = this.cleanEndpoint(config?.endpoint);
    const idInstance = this.cleanInstanceId(config?.instanceName);
    const token = this.getToken(config);

    if (!baseUrl || !idInstance || !token) {
      return {
        success: false,
        message: 'API URL, ID da Instância e Token são obrigatórios para a GREEN-API.'
      };
    }

    try {
      // 1. Consulta o estado da instância
      const stateRes = await fetch(`${baseUrl}/waInstance${idInstance}/getStateInstance/${token}`);
      if (stateRes.ok) {
        const stateData = await stateRes.json().catch(() => ({}));
        if (stateData?.stateInstance === 'authorized') {
          return {
            success: true,
            message: 'Instância da GREEN-API já está conectada e autorizada no WhatsApp.'
          };
        }
      }

      // 2. Se não estiver autorizada, solicita o QR Code
      const qrRes = await fetch(`${baseUrl}/waInstance${idInstance}/qr/${token}`);
      if (qrRes.ok) {
        const qrData = await qrRes.json().catch(() => ({}));
        if (qrData?.message) {
          return {
            success: true,
            qrCode: qrData.message,
            message: 'QR Code da GREEN-API gerado. Escaneie no WhatsApp da igreja para conectar a instância.'
          };
        }
      }

      return {
        success: true,
        message: 'Instância da GREEN-API configurada. Verifique o status no painel da Green-API.'
      };
    } catch (err) {
      return {
        success: false,
        message: `Falha ao conectar com GREEN-API: ${(err as Error).message}`
      };
    }
  }

  async getConnectionStatus(config?: WhatsAppProviderConfig): Promise<WhatsAppConnectionStatus> {
    const baseUrl = this.cleanEndpoint(config?.endpoint);
    const idInstance = this.cleanInstanceId(config?.instanceName);
    const token = this.getToken(config);

    if (!baseUrl || !idInstance || !token) {
      return {
        state: 'disconnected',
        isSimulated: false,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: 'Configuração incompleta (URL, ID da Instância ou Token da GREEN-API ausente).'
      };
    }

    try {
      const res = await fetch(`${baseUrl}/waInstance${idInstance}/getStateInstance/${token}`);
      if (!res.ok) {
        return {
          state: 'disconnected',
          isSimulated: false,
          lastCheckedAt: new Date().toISOString(),
          errorMessage: `GREEN-API retornou status HTTP ${res.status}`
        };
      }

      const data = await res.json().catch(() => ({}));
      const stateInstance = data?.stateInstance;

      let state: WhatsAppConnectionStatus['state'] = 'disconnected';
      if (stateInstance === 'authorized') {
        state = 'connected';
      } else if (stateInstance === 'starting' || stateInstance === 'sleepMode') {
        state = 'connecting';
      }

      return {
        state,
        instanceName: idInstance,
        phoneNumber: `GREEN-API Instância ${idInstance}`,
        isSimulated: false,
        lastCheckedAt: new Date().toISOString()
      };
    } catch (err) {
      return {
        state: 'disconnected',
        isSimulated: false,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: `Erro de conexão: ${(err as Error).message}`
      };
    }
  }

  async getGroups(config?: WhatsAppProviderConfig): Promise<WhatsAppGroupInfo[]> {
    // Retorna o grupo padrão configurado na igreja
    return [
      {
        id: '120363361678530962@g.us',
        name: 'IGEAD-MT • Grupo Oficial da Igreja',
        isReadOnly: false
      }
    ];
  }

  /**
   * Envia mensagem para o grupo de WhatsApp via GREEN-API
   * Endpoint oficial: POST ${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}
   * Payload: { "chatId": "120363361678530962@g.us", "message": "..." }
   */
  async sendGroupMessage(
    groupId: string,
    messageText: string,
    config?: WhatsAppProviderConfig
  ): Promise<WhatsAppSendResult> {
    const baseUrl = this.cleanEndpoint(config?.endpoint);
    const idInstance = this.cleanInstanceId(config?.instanceName);
    const token = this.getToken(config);

    if (!baseUrl || !idInstance || !token) {
      return {
        success: false,
        error: 'Credenciais da GREEN-API não informadas (API URL, ID da Instância ou Token ausente).'
      };
    }

    // Normaliza o identificador do grupo para garantir que termina com @g.us
    const chatId = groupId.includes('@') ? groupId.trim() : `${groupId.trim()}@g.us`;
    const sendUrl = `${baseUrl}/waInstance${idInstance}/sendMessage/${token}`;

    try {
      const payload = {
        chatId,
        message: messageText
      };

      const res = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      // Sucesso na GREEN-API retorna { "idMessage": "..." }
      if (res.ok && (data?.idMessage || data?.id)) {
        return {
          success: true,
          providerMessageId: String(data.idMessage || data.id),
          sentAt: new Date().toISOString(),
          isSimulated: false
        };
      }

      const errorDetail =
        data?.message ||
        data?.error ||
        (typeof data === 'string' ? data : `HTTP ${res.status}`);

      return {
        success: false,
        error: `GREEN-API retornou erro: ${errorDetail}`
      };
    } catch (err) {
      return {
        success: false,
        error: `Falha ao enviar via GREEN-API (${sendUrl}): ${(err as Error).message}`
      };
    }
  }

  async disconnect(config?: WhatsAppProviderConfig): Promise<{ success: boolean; message: string }> {
    const baseUrl = this.cleanEndpoint(config?.endpoint);
    const idInstance = this.cleanInstanceId(config?.instanceName);
    const token = this.getToken(config);

    try {
      const res = await fetch(`${baseUrl}/waInstance${idInstance}/logout/${token}`, {
        method: 'GET'
      });
      return {
        success: res.ok,
        message: res.ok ? 'Instância desconectada na GREEN-API.' : 'Erro ao desconectar na GREEN-API.'
      };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  }
}
