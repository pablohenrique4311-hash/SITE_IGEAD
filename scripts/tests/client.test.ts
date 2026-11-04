import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { WhatsAppAutomationService } from '../../src/services/whatsappAutomationService';

function clientWithHttp(handler: typeof fetch) {
  return createClient('https://database.test', 'publishable-test', {
    auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: handler },
  });
}
const settings = {
  id: 'default', isEnabled: false, scheduledTime: '07:00', timezone: 'America/Cuiaba',
  targetGroupId: '12345@g.us', targetGroupName: 'Teste', providerType: 'greenapi' as const, updatedAt: '',
};

test('erro 503 ao pausar gera rejeição, não sucesso nem armazenamento local', async () => {
  const calls: string[] = [];
  const service = new WhatsAppAutomationService(clientWithHttp(async (input, init) => {
    const url = String(input); calls.push(url);
    if (url.includes('/rpc/is_whatsapp_admin')) return new Response('true', { status: 200 });
    assert.equal(init?.method, 'PATCH');
    const payload = JSON.parse(String(init?.body));
    assert.equal(payload.is_enabled, false);
    assert.equal(Object.hasOwn(payload, 'provider_token'), false);
    return new Response('{"message":"unavailable"}', { status: 503 });
  }));
  await assert.rejects(service.saveSettings(settings), /não foram salvas/);
  assert.equal(calls.length, 2);
});

test('função rejeitada não provoca fallback ao gateway', async () => {
  const calls: string[] = [];
  const service = new WhatsAppAutomationService(clientWithHttp(async (input) => {
    calls.push(String(input));
    return new Response('{"error":"forbidden"}', { status: 403 });
  }));
  await assert.rejects(service.sendTestMessage(), /não foi possível/i);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].includes('/functions/v1/whatsapp-daily-word'));
});

test('metadados extras recebidos do servidor não chegam às configurações públicas', async () => {
  const service = new WhatsAppAutomationService(clientWithHttp(async (input) => {
    if (String(input).includes('/rpc/')) return new Response('true');
    const url = new URL(String(input));
    assert.equal(url.searchParams.get('select')?.includes('provider_token'), false);
    return new Response(JSON.stringify({ id: 'default', is_enabled: false, provider_token: 'synthetic-secret' }));
  }));
  assert.equal(JSON.stringify(await service.getSettings()).includes('synthetic-secret'), false);
});

test('próximo horário usa Cuiabá na virada do dia, independente do fuso local', () => {
  const service = new WhatsAppAutomationService();
  assert.equal(service.calculateNextRun('07:00', new Date('2026-11-05T02:00:00Z')).nextRunDate.toISOString(), '2026-11-05T11:00:00.000Z');
  assert.equal(service.calculateNextRun('07:00', new Date('2026-11-05T12:00:00Z')).nextRunDate.toISOString(), '2026-11-06T11:00:00.000Z');
  assert.throws(() => service.calculateNextRun('25:90'));
});
