import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { Gateway } from '../../supabase/functions/_shared/gateway';
import { createWhatsAppHandler, type WhatsAppStore } from '../../supabase/functions/_shared/whatsappHandler';

const config = { type: 'greenapi', endpoint: 'https://provider.test', instance: 'test', token: 'test-token', allowedOrigins: ['https://provider.test'] };

test('gateway usa HTTP local real para sucesso, 401, 429, 503 e JSON inválido', async () => {
  let status = 200;
  let body = JSON.stringify({ idMessage: 'provider-message' });
  let calls = 0;
  const server = createServer(async (req, res) => {
    calls++;
    let raw = '';
    for await (const chunk of req) raw += chunk;
    assert.equal(req.method, 'POST');
    assert.equal(req.url, '/waInstancetest/sendMessage/test-token');
    assert.deepEqual(JSON.parse(raw), { chatId: '12345@g.us', message: 'Sintética' });
    res.writeHead(status, { 'Content-Type': 'application/json', ...(status === 302 ? { Location: 'https://untrusted.invalid' } : {}) });
    res.end(body);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as { port: number }).port;
  // Somente o destino de transporte muda para o servidor local; protocolo/payload reais.
  const transport: typeof fetch = (input, init) => fetch(`http://127.0.0.1:${port}${new URL(String(input)).pathname}`, init);
  try {
    const gateway = new Gateway(config, transport);
    const success = await gateway.send('12345@g.us', 'Sintética');
    assert.equal(success.success, true);
    assert.equal(success.providerMessageId, 'provider-message');
    for (const code of [401, 429, 503, 302]) {
      status = code;
      const result = await gateway.send('12345@g.us', 'Sintética');
      assert.equal(result.success, false);
      assert.equal(result.uncertain, code >= 500 || code === 302);
      assert.equal(JSON.stringify(result).includes(config.token), false);
    }
    status = 200; body = 'invalid-json';
    assert.equal((await gateway.send('12345@g.us', 'Sintética')).uncertain, true);
    assert.equal(calls, 6);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('gateway bloqueia credenciais ausentes, destinos não permitidos e provedor inválido sem HTTP', async () => {
  let calls = 0;
  const http: typeof fetch = async () => { calls++; throw new Error('unexpected'); };
  for (const override of [{ token: '' }, { endpoint: 'http://127.0.0.1' }, { endpoint: 'https://evil.test' }, { type: 'zapi' }]) {
    const result = await new Gateway({ ...config, ...override }, http).send('12345@g.us', 'Teste');
    assert.equal(result.success, false);
    assert.equal(result.uncertain, undefined);
  }
  assert.equal(calls, 0);
});

test('falha de transporte mantém resultado incerto e não revela URL nem token', async () => {
  const http: typeof fetch = async () => { throw new Error(`Timeout na URL com ${config.token}`); };
  const result = await new Gateway(config, http).send('12345@g.us', 'Teste');
  assert.equal(result.success, false);
  assert.equal(result.uncertain, true);
  assert.equal(JSON.stringify(result).includes(config.token), false);
});

test('handler bloqueia autenticação, origem, ação, override de destino e simulação implícita', async () => {
  let writes = 0;
  const store: WhatsAppStore = {
    authorize: async (token) => token === 'admin',
    settings: async () => ({ is_enabled: true, scheduled_time: '07:00', target_group_id: '12345@g.us', target_group_name: 'Teste', provider_type: 'zapi' }),
    word: async () => null, enqueue: async () => { writes++; }, claim: async () => null, finish: async () => {},
  };
  const handler = createWhatsAppHandler({ store, gateway: () => new Gateway(config), cronSecret: 'cron', allowedOrigins: ['https://site.test'] });
  const request = (token?: string, body: object = { action: 'test' }, origin?: string) => new Request('https://function.test', {
    method: 'POST', headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(origin ? { origin } : {}) }, body: JSON.stringify(body),
  });
  assert.equal((await handler(request())).status, 401);
  assert.equal((await handler(request('invalid'))).status, 403);
  assert.equal((await handler(request('member'))).status, 403);
  assert.equal((await handler(request('admin', undefined, 'https://evil.test'))).status, 403);
  assert.equal((await handler(request('admin', { action: 'test', providerEndpoint: 'http://internal' }))).status, 400);
  assert.equal((await handler(request('cron'))).status, 403);
  assert.equal((await handler(request('admin'))).status, 400);
  assert.equal(writes, 0);
});

test('simulação é explícita; falha ao gravar histórico não confirma sucesso', async () => {
  let job: any;
  let failHistory = false;
  const store: WhatsAppStore = {
    authorize: async () => true,
    settings: async () => ({ is_enabled: true, scheduled_time: '07:00', target_group_id: '12345@g.us', target_group_name: 'Teste', provider_type: 'simulation' }),
    word: async () => null, enqueue: async (value) => { job = { ...value, claim_id: 'claim' }; },
    claim: async (id) => { assert.equal(id, job.id); return job; },
    finish: async () => { if (failHistory) throw new Error('DB unavailable'); },
  };
  const handler = createWhatsAppHandler({ store, gateway: (type) => new Gateway({ ...config, type }), cronSecret: '', allowedOrigins: [] });
  const request = () => new Request('https://function.test', { method: 'POST', headers: { authorization: 'Bearer admin' }, body: '{"action":"test"}' });
  const response = await handler(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).isSimulated, true);
  failHistory = true;
  assert.equal((await handler(request())).status, 500);
});


test('timeout HTTP real cancela a requisição e exige reconciliação', async () => {
  let accepted = false;
  const server = createServer((req) => { accepted = true; req.resume(); });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as { port: number }).port;
  const transport: typeof fetch = (input, init) => fetch(`http://127.0.0.1:${port}${new URL(String(input)).pathname}`, init);
  try {
    const result = await new Gateway(config, transport, 100).send('12345@g.us', 'Sintética');
    assert.equal(accepted, true);
    assert.equal(result.success, false);
    assert.equal(result.uncertain, true);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
