import { WhatsAppProviderType } from '../../types/whatsappAutomation';
import { GreenApiWhatsAppProvider } from './GreenApiProvider';
import { EvolutionApiWhatsAppProvider } from './EvolutionApiProvider';
import { IWhatsAppProvider } from './IWhatsAppProvider';
import { SimulationWhatsAppProvider } from './SimulationProvider';
import { ZApiWhatsAppProvider } from './ZApiProvider';

const greenApiProvider = new GreenApiWhatsAppProvider();
const evolutionProvider = new EvolutionApiWhatsAppProvider();
const zapiProvider = new ZApiWhatsAppProvider();
const simulationProvider = new SimulationWhatsAppProvider();

export class WhatsAppProviderFactory {
  static getProvider(type: WhatsAppProviderType = 'greenapi'): IWhatsAppProvider {
    switch (type) {
      case 'greenapi':
        return greenApiProvider;
      case 'evolution':
        return evolutionProvider;
      case 'zapi':
        return zapiProvider;
      case 'simulation':
        return simulationProvider;
      default:
        return greenApiProvider;
    }
  }

  static getAllProviders(): { id: WhatsAppProviderType; name: string; isSimulation: boolean; description: string }[] {
    return [
      {
        id: 'greenapi',
        name: 'GREEN-API (Gratuito / Developer)',
        isSimulation: false,
        description: 'Gateway oficial com plano Developer gratuito. Envia a Palavra do Dia diretamente para grupos existentes (@g.us) via /sendMessage.'
      },
      {
        id: 'evolution',
        name: 'Evolution API (Gateway Self-hosted)',
        isSimulation: false,
        description: 'Gateway open-source compatível com WhatsApp Business para envio em grupos existentes.'
      },
      {
        id: 'zapi',
        name: 'Z-API (Gateway Comercial)',
        isSimulation: false,
        description: 'Plataforma comercial brasileira com suporte a grupos via WhatsApp Business.'
      },
      {
        id: 'simulation',
        name: 'Modo Simulação (Ambiente de Testes Local)',
        isSimulation: true,
        description: 'Permite testar agendamentos, filas e visualização sem disparar mensagens reais no grupo da igreja.'
      }
    ];
  }
}
