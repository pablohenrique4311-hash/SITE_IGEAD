import {
  WhatsAppConnectionStatus,
  WhatsAppGroupInfo,
  WhatsAppProviderType,
  WhatsAppSendResult
} from '../../types/whatsappAutomation';
import { IWhatsAppProvider, WhatsAppProviderConfig } from './IWhatsAppProvider';

/**
 * Provedor para Evolution API (v2)
 * Fornecedor amplamente utilizado para automações no Brasil, compatível com WhatsApp Business
 * e publicação direta em grupos existentes (@g.us).
 */
export class EvolutionApiWhatsAppProvider implements IWhatsAppProvider {
  readonly id: WhatsAppProviderType = 'evolution';
  readonly name = 'Evolution API (Gateway Oficial/Self-hosted)';
  readonly isSimulation = false;

  private getHeaders(config?: WhatsAppProviderConfig): HeadersInit {
    const apiKey = config?.apiKey || '';
    return {
      'Content-Type': 'application/json',
      apikey: apiKey
    };
  }

  private cleanEndpoint(endpoint?: string): string {
    const raw = endpoint || '';
    return raw.replace(/\/+$/, '');
  }

  async connect(config?: WhatsAppProviderConfig): Promise<{ success: boolean; qrCode?: string; message: string }> {
    const baseUrl = this.cleanEndpoint(config?.endpoint);
    const instance = config?.instanceName || 'igead_oficial';

    if (!baseUrl || !config?.apiKey) {
      return {
        success: false,
        message: 'Endpoint e Chave de API (apikey) são obrigatórios para conectar a Evolution API.'
      };
    }

    try {
      const res = await fetch(`${baseUrl}/instance/connect/${instance}`, {
        method: 'GET',
        headers: this.getHeaders(config)
      });

      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          qrCode: data.base64 || data.code,
          message: 'Instância da Evolution API inicializada. Escaneie o QR Code no WhatsApp Business da igreja.'
        };
      }

      return {
        success: false,
        message: data?.message || `Erro HTTP ${res.status} ao conectar na Evolution API.`
      };
    } catch (err) {
      return {
        success: false,
        message: `Falha de rede ao conectar com a Evolution API: ${(err as Error).message}`
      };
    }
  }

  async getConnectionStatus(config?: WhatsAppProviderConfig): Promise<WhatsAppConnectionStatus> {
    const baseUrl = this.cleanEndpoint(config?.endpoint);
    const instance = config?.instanceName || 'igead_oficial';

    if (!baseUrl || !config?.apiKey) {
      return {
        state: 'disconnected',
        isSimulated: false,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: 'Configuração incompleta (Endpoint ou API Key ausente).'
      };
    }

    try {
      const res = await fetch(`${baseUrl}/instance/connectionState/${instance}`, {
        method: 'GET',
        headers: this.getHeaders(config)
      });

      if (!res.ok) {
        return {
          state: 'disconnected',
          isSimulated: false,
          lastCheckedAt: new Date().toISOString(),
          errorMessage: `Status HTTP ${res.status}`
        };
      }

      const data = await res.json();
      const rawState = data?.instance?.state || data?.state || 'close';

      let state: WhatsAppConnectionStatus['state'] = 'disconnected';
      if (rawState === 'open') state = 'connected';
      else if (rawState === 'connecting') state = 'connecting';

      return {
        state,
        instanceName: instance,
        phoneNumber: data?.instance?.owner || data?.owner,
        isSimulated: false,
        lastCheckedAt: new Date().toISOString()
      };
    } catch (err) {
      return {
        state: 'disconnected',
        isSimulated: false,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: (err as Error).message
      };
    }
  }

  async getGroups(config?: WhatsAppProviderConfig): Promise<WhatsAppGroupInfo[]> {
    const baseUrl = this.cleanEndpoint(config?.endpoint);
    const instance = config?.instanceName || 'igead_oficial';

    if (!baseUrl || !config?.apiKey) return [];

    try {
      const res = await fetch(`${baseUrl}/group/fetchAllGroups/${instance}?getParticipants=false`, {
        method: 'GET',
        headers: this.getHeaders(config)
      });

      if (!res.ok) return [];
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.groups || [];

      return list.map((item: Record<string, unknown>) => ({
        id: (item.id as string) || (item.jid as string) || '',
        name: (item.subject as string) || (item.name as string) || 'Grupo sem nome',
        participantsCount: Array.isArray(item.participants) ? item.participants.length : undefined,
        isReadOnly: Boolean(item.announce || item.restrict)
      }));
    } catch (err) {
      console.warn('[Evolution API] Erro ao buscar grupos:', err);
      return [];
    }
  }

  async sendGroupMessage(
    groupId: string,
    messageText: string,
    config?: WhatsAppProviderConfig
  ): Promise<WhatsAppSendResult> {
    const baseUrl = this.cleanEndpoint(config?.endpoint);
    const instance = config?.instanceName || 'igead_oficial';
    const apiKey = config?.apiKey || (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_EVOLUTION_API_KEY || '';

    if (!baseUrl || !apiKey) {
      return {
        success: false,
        error: 'Credenciais da Evolution API não informadas (Endpoint URL ou Chave de API apikey ausente).'
      };
    }

    try {
      const payload = {
        number: groupId,
        text: messageText,
        options: {
          delay: 1200,
          presence: 'composing',
          linkPreview: false
        }
      };

      const res = await fetch(`${baseUrl}/message/sendText/${instance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data?.key?.id || data?.id || data?.messageId || data?.status === 'PENDING' || data?.status === 'SUCCESS')) {
        return {
          success: true,
          providerMessageId: String(data?.key?.id || data?.id || data?.messageId || `EVOLUTION_${Date.now()}`),
          sentAt: new Date().toISOString(),
          isSimulated: false
        };
      }

      const errorDetail =
        data?.response?.message ||
        data?.message ||
        (Array.isArray(data?.response?.message) ? data.response.message.join(', ') : `HTTP ${res.status}`);

      return {
        success: false,
        error: `Evolution API retornou erro: ${errorDetail}`
      };
    } catch (err) {
      return {
        success: false,
        error: `Erro ao enviar via Evolution API (${baseUrl}/message/sendText/${instance}): ${(err as Error).message}`
      };
    }
  }

  async disconnect(config?: WhatsAppProviderConfig): Promise<{ success: boolean; message: string }> {
    const baseUrl = this.cleanEndpoint(config?.endpoint);
    const instance = config?.instanceName || 'igead_oficial';

    try {
      const res = await fetch(`${baseUrl}/instance/logout/${instance}`, {
        method: 'DELETE',
        headers: this.getHeaders(config)
      });
      return {
        success: res.ok,
        message: res.ok ? 'Instância desconectada com sucesso.' : 'Erro ao desconectar instância.'
      };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  }
}
