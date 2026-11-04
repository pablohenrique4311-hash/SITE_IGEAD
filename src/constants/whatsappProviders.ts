export const WHATSAPP_PROVIDERS = [
  { id: 'greenapi' as const, name: 'GREEN-API', isSimulation: false, description: 'Envio executado pelo servidor.' },
  { id: 'evolution' as const, name: 'Evolution API', isSimulation: false, description: 'Envio executado pelo servidor.' },
  { id: 'simulation' as const, name: 'Simulação', isSimulation: true, description: 'Registra testes sem enviar mensagens.' },
];
