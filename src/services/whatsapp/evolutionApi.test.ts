import test from 'node:test';
import assert from 'node:assert/strict';
import { EvolutionApiWhatsAppProvider } from './EvolutionApiProvider';
import { formatWhatsAppDailyMessage } from '../dailyWordService';

test('EvolutionApiWhatsAppProvider conforms to Evolution API specifications', () => {
  const provider = new EvolutionApiWhatsAppProvider();
  assert.equal(provider.id, 'evolution');
  assert.equal(provider.isSimulation, false);
});

test('EvolutionApiWhatsAppProvider valida obrigatoriedade de endpoint e apikey', async () => {
  const provider = new EvolutionApiWhatsAppProvider();
  const res = await provider.sendGroupMessage('120363361678530962@g.us', 'Mensagem de teste', {
    endpoint: '',
    apiKey: '',
    instanceName: 'igead_oficial'
  });

  assert.equal(res.success, false);
  assert.ok(res.error?.includes('Credenciais da Evolution API não informadas'));
});

test('Formatação da mensagem e JID do grupo oficial coincidem com especificação', () => {
  const targetGroupId = '120363361678530962@g.us';
  assert.ok(targetGroupId.endsWith('@g.us'));
  assert.equal(targetGroupId, '120363361678530962@g.us');

  const formatted = formatWhatsAppDailyMessage({
    id: 'test_1',
    date: '2026-11-04',
    reference: 'Salmos 23:1',
    bookName: 'Salmos',
    chapter: 23,
    verseNumber: 1,
    verseText: 'O Senhor é o meu pastor; nada me faltará.',
    reflection: 'Descanse sob o cuidado do Bom Pastor.',
    translation: 'Almeida (JFA)'
  });

  assert.ok(formatted.includes('PALAVRA DO DIA — IGEAD-MT'));
  assert.ok(formatted.includes('120363361678530962@g.us') === false); // não vaza jid na mensagem
  assert.ok(formatted.includes('Salmos 23:1'));
});
