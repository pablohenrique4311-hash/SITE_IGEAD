import {
  WhatsAppConnectionStatus,
  WhatsAppGroupInfo,
  WhatsAppProviderType,
  WhatsAppSendResult
} from '../../types/whatsappAutomation';
import { IWhatsAppProvider, WhatsAppProviderConfig } from './IWhatsAppProvider';

/**
 * Provedor para Z-API
 * Serviço brasileiro amplamente consolidado para WhatsApp Business e suporte a grupos existentes.
 */
export class ZApiWhatsAppProvider implements IWhatsAppProvider {
  readonly id: WhatsAppProviderType = 'zapi';
  readonly name = 'Z-API (Gateway Brasileiro)';
  readonly isSimulation = false;

  private cleanEndpoint(endpoint?: string): string {
    const raw = endpoint || 'https://api.z-api.io';
    return raw.replace(/\/+$/, '');
  }

  private getUrl(path: string, config?: WhatsAppProviderConfig): string {
    const base = this.cleanEndpoint(config?.endpoint);
    const instance = config?.instanceName || '';
    const token = config?.token || config?.apiKey || '';
    return `${base}/instances/${instance}/token/${token}/${path.replace(/^\/+/, '')}`;
  }

  async connect(config?: WhatsAppProviderConfig): Promise<{ success: boolean; qrCode?: string; message: string }> {
    if (!config?.instanceName || (!config?.token && !config?.apiKey)) {
      return {
        success: false,
        message: 'Instance ID e Token são obrigatórios para conectar a Z-API.'
      };
    }

    try {
      const url = this.getUrl('qr-code', config);
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        return {
          success: true,
          qrCode: data.value || data.base64,
          message: 'QR Code da Z-API gerado com sucesso. Escaneie pelo WhatsApp Business da igreja.'
        };
      }
      return { success: false, message: data?.message || 'Falha ao gerar QR Code na Z-API.' };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  }

  async getConnectionStatus(config?: WhatsAppProviderConfig): Promise<WhatsAppConnectionStatus> {
    if (!config?.instanceName || (!config?.token && !config?.apiKey)) {
      return {
        state: 'disconnected',
        isSimulated: false,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: 'Configuração incompleta da Z-API (Instance ID ou Token ausente).'
      };
    }

    try {
      const url = this.getUrl('status', config);
      const res = await fetch(url);
      if (!res.ok) {
        return {
          state: 'disconnected',
          isSimulated: false,
          lastCheckedAt: new Date().toISOString(),
          errorMessage: `Status HTTP ${res.status}`
        };
      }

      const data = await res.json();
      const isConnected = Boolean(data?.connected);

      return {
        state: isConnected ? 'connected' : 'disconnected',
        phoneNumber: data?.phone,
        instanceName: config.instanceName,
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
    if (!config?.instanceName || (!config?.token && !config?.apiKey)) return [];

    try {
      const url = this.getUrl('chats/groups', config);
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.groups || [];

      return list.map((item: Record<string, unknown>) => ({
        id: (item.phone as string) || (item.id as string) || '',
        name: (item.name as string) || 'Grupo sem título',
        participantsCount: typeof item.participantsCount === 'number' ? item.participantsCount : undefined,
        isReadOnly: Boolean(item.isReadOnly)
      }));
    } catch (err) {
      console.warn('[Z-API] Falha ao carregar grupos:', err);
      return [];
    }
  }

  async sendGroupMessage(
    groupId: string,
    messageText: string,
    config?: WhatsAppProviderConfig
  ): Promise<WhatsAppSendResult> {
    if (!config?.instanceName || (!config?.token && !config?.apiKey)) {
      return {
        success: false,
        error: 'Credenciais da Z-API não configuradas.'
      };
    }

    try {
      const url = this.getUrl('send-text', config);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: groupId,
          message: messageText
        })
      });

      const data = await res.json();

      if (res.ok && (data?.zaapId || data?.messageId || data?.id)) {
        return {
          success: true,
          providerMessageId: data.zaapId || data.messageId || data.id,
          sentAt: new Date().toISOString(),
          isSimulated: false
        };
      }

      return {
        success: false,
        error: data?.message || data?.error || `Falha no envio Z-API (HTTP ${res.status})`
      };
    } catch (err) {
      return {
        success: false,
        error: `Erro ao enviar via Z-API: ${(err as Error).message}`
      };
    }
  }

  async disconnect(config?: WhatsAppProviderConfig): Promise<{ success: boolean; message: string }> {
    try {
      const url = this.getUrl('disconnect', config);
      const res = await fetch(url);
      return {
        success: res.ok,
        message: res.ok ? 'Instância Z-API desconectada com sucesso.' : 'Erro ao desconectar.'
      };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  }
}
