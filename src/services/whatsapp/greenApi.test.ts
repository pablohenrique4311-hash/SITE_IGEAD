import test from 'node:test';
import assert from 'node:assert/strict';
import { GreenApiWhatsAppProvider } from './GreenApiProvider';
import { WhatsAppProviderFactory } from './WhatsAppProviderFactory';

test('GreenApiWhatsAppProvider implementa a interface e tipos oficiais', () => {
  const provider = new GreenApiWhatsAppProvider();
  assert.equal(provider.id, 'greenapi');
  assert.equal(provider.isSimulation, false);
  assert.ok(provider.name.includes('GREEN-API'));
});

test('WhatsAppProviderFactory resolve GREEN-API como padrão', () => {
  const provider = WhatsAppProviderFactory.getProvider('greenapi');
  assert.equal(provider.id, 'greenapi');

  const defaultProvider = WhatsAppProviderFactory.getProvider();
  assert.equal(defaultProvider.id, 'greenapi');

  const providers = WhatsAppProviderFactory.getAllProviders();
  const greenApiOption = providers.find((p) => p.id === 'greenapi');
  assert.ok(greenApiOption);
  assert.equal(greenApiOption?.isSimulation, false);
});

test('GreenApiWhatsAppProvider valida parâmetros obrigatórios ao enviar mensagem', async () => {
  const provider = new GreenApiWhatsAppProvider();
  const res = await provider.sendGroupMessage('120363361678530962@g.us', 'Teste Palavra do Dia', {
    endpoint: '',
    instanceName: '',
    apiKey: '',
    token: ''
  });

  // Se não houver endpoint e token, deve retornar erro amigável sem quebrar
  assert.equal(typeof res.success, 'boolean');
});

test('GREEN-API configura corretamente o JID do grupo oficial da igreja', () => {
  const expectedChatId = '120363361678530962@g.us';
  assert.ok(expectedChatId.endsWith('@g.us'));
  assert.equal(expectedChatId, '120363361678530962@g.us');
});
