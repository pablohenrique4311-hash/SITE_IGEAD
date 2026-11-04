import { WhatsAppProviderType } from '../../types/whatsappAutomation';
import { EvolutionApiWhatsAppProvider } from './EvolutionApiProvider';
import { IWhatsAppProvider } from './IWhatsAppProvider';
import { SimulationWhatsAppProvider } from './SimulationProvider';
import { ZApiWhatsAppProvider } from './ZApiProvider';

const simulationProvider = new SimulationWhatsAppProvider();
const evolutionProvider = new EvolutionApiWhatsAppProvider();
const zapiProvider = new ZApiWhatsAppProvider();

export class WhatsAppProviderFactory {
  static getProvider(type: WhatsAppProviderType = 'simulation'): IWhatsAppProvider {
    switch (type) {
      case 'evolution':
        return evolutionProvider;
      case 'zapi':
        return zapiProvider;
      case 'simulation':
      default:
        return simulationProvider;
    }
  }

  static getAllProviders(): { id: WhatsAppProviderType; name: string; isSimulation: boolean; description: string }[] {
    return [
      {
        id: 'simulation',
        name: 'Modo Simulação (Ambiente de Testes Seguro)',
        isSimulation: true,
        description: 'Permite testar agendamentos, filas, formatação e fluxo sem disparar mensagens reais no grupo da igreja.'
      },
      {
        id: 'evolution',
        name: 'Evolution API (Recomendado • Suporta Grupos Existentes)',
        isSimulation: false,
        description: 'Gateway open-source amplamente utilizado no Brasil. Conecta ao WhatsApp Business da igreja via QR Code e envia mensagens para o grupo existente.'
      },
      {
        id: 'zapi',
        name: 'Z-API (Gateway Comercial Brasileiro)',
        isSimulation: false,
        description: 'Plataforma comercial brasileira com suporte nativo a envio de mensagens em grupos existentes via WhatsApp Business.'
      }
    ];
  }
}
