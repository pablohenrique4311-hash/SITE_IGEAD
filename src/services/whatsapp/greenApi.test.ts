import test from 'node:test';
import assert from 'node:assert/strict';
import { Gateway } from '../../../supabase/functions/_shared/gateway';

const config = { type: 'greenapi', endpoint: 'https://provider.test', instance: 'test', token: 'synthetic', allowedOrigins: ['https://provider.test'] };
test('GREEN-API confirma conexão somente quando o provedor informa authorized', async () => {
  const http: typeof fetch = async () => new Response('{"stateInstance":"authorized"}');
  assert.equal((await new Gateway(config, http).status()).state, 'connected');
  const unavailable: typeof fetch = async () => new Response('{}', { status: 503 });
  assert.equal((await new Gateway(config, unavailable).status()).state, 'disconnected');
});
test('GREEN-API exige identificador da mensagem para confirmar aceite', async () => {
  const http: typeof fetch = async () => new Response('{}');
  const result = await new Gateway(config, http).send('12345@g.us', 'Sintética');
  assert.equal(result.success, false);
  assert.equal(result.uncertain, true);
});
