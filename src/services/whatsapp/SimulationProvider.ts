import {
  WhatsAppConnectionStatus,
  WhatsAppGroupInfo,
  WhatsAppProviderType,
  WhatsAppSendResult
} from '../../types/whatsappAutomation';
import { IWhatsAppProvider, WhatsAppProviderConfig } from './IWhatsAppProvider';

const SIM_STORAGE_KEY = 'igead_whatsapp_simulation_state';

interface SimulationState {
  isConnected: boolean;
  phoneNumber: string;
  instanceName: string;
}

export class SimulationWhatsAppProvider implements IWhatsAppProvider {
  readonly id: WhatsAppProviderType = 'simulation';
  readonly name = 'Modo Simulação (Ambiente de Testes)';
  readonly isSimulation = true;

  private getState(): SimulationState {
    try {
      const raw = localStorage.getItem(SIM_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Fallback
    }
    return {
      isConnected: true,
      phoneNumber: '5565996443569',
      instanceName: 'igead_business_simulado'
    };
  }

  private saveState(state: SimulationState) {
    try {
      localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignora erro de storage
    }
  }

  async connect(): Promise<{ success: boolean; qrCode?: string; message: string }> {
    this.saveState({
      isConnected: true,
      phoneNumber: '5565996443569',
      instanceName: 'igead_business_simulado'
    });
    return {
      success: true,
      message: '[SIMULAÇÃO] WhatsApp Business conectado com sucesso no ambiente de testes.'
    };
  }

  async getConnectionStatus(): Promise<WhatsAppConnectionStatus> {
    const state = this.getState();
    return {
      state: state.isConnected ? 'simulated' : 'disconnected',
      phoneNumber: state.phoneNumber,
      instanceName: state.instanceName,
      batteryLevel: 94,
      isSimulated: true,
      lastCheckedAt: new Date().toISOString()
    };
  }

  async getGroups(): Promise<WhatsAppGroupInfo[]> {
    return [
      {
        id: '120363049182394@g.us',
        name: 'IGEAD-MT • Grupo Oficial da Igreja',
        participantsCount: 38,
        unreadCount: 0,
        isReadOnly: false
      },
      {
        id: '120363098234123@g.us',
        name: 'IGEAD-MT • Liderança & Ministério Pastoral',
        participantsCount: 16,
        unreadCount: 0,
        isReadOnly: false
      },
      {
        id: '120363112349876@g.us',
        name: 'IGEAD-MT • Jovens Geração Eleita',
        participantsCount: 29,
        unreadCount: 0,
        isReadOnly: false
      }
    ];
  }

  async sendGroupMessage(
    groupId: string,
    messageText: string
  ): Promise<WhatsAppSendResult> {
    const state = this.getState();
    if (!state.isConnected) {
      return {
        success: false,
        error: '[SIMULAÇÃO] O WhatsApp simulado está desconectado. Conecte antes de enviar.',
        isSimulated: true
      };
    }

    const providerMessageId = `SIM_WA_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    console.info(
      `%c[SIMULAÇÃO WHATSAPP — PALAVRA DO DIA]\n%cDestino: ${groupId}\nID: ${providerMessageId}\n\n${messageText}`,
      'color: #d97706; font-weight: bold; font-size: 13px;',
      'color: #27272a; font-family: monospace;'
    );

    return {
      success: true,
      providerMessageId,
      sentAt: new Date().toISOString(),
      isSimulated: true
    };
  }

  async disconnect(): Promise<{ success: boolean; message: string }> {
    this.saveState({
      isConnected: false,
      phoneNumber: '5565996443569',
      instanceName: 'igead_business_simulado'
    });
    return {
      success: true,
      message: '[SIMULAÇÃO] WhatsApp desconectado no ambiente de testes.'
    };
  }
}
