import test from 'node:test';
import assert from 'node:assert/strict';
import { sendPrayerRequest, savePrayerLocally } from '../../src/services/prayerService';
import { Gateway } from '../../supabase/functions/_shared/gateway';

// Contratos desejados: ficam vermelhos até as correções. Nenhum envio externo.
const request = {
  name: 'Pessoa de teste',
  phone: '00000000000',
  category: 'saude',
  message: 'CONTEUDO_CONFIDENCIAL_DE_TESTE',
  isConfidential: true,
};

function installStorage() {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    },
  });
  return {
    values,
    restore() {
      if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
      else Reflect.deleteProperty(globalThis, 'localStorage');
    },
  };
}

test('pedido não deve confirmar entrega quando o serviço responde HTTP 503', async (t) => {
  const storage = installStorage();
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 503 }));
  try {
    const result = await sendPrayerRequest(request);
    assert.ok(fetchMock.mock.callCount() > 0, 'deve exercitar o envio');
    assert.equal(result.success, false, 'HTTP 503 não comprova entrega');
  } finally {
    storage.restore();
  }
});

test('pedido confidencial não deve persistir conteúdo em localStorage', () => {
  const storage = installStorage();
  try {
    savePrayerLocally(request);
    const persisted = [...storage.values.values()].join('\n');
    assert.equal(persisted.includes(request.message), false, 'conteúdo confidencial persistido');
  } finally {
    storage.restore();
  }
});

test('provedor sem credenciais explícitas deve falhar sem fazer chamada HTTP', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 503 }));
  const provider = new Gateway({ type: 'greenapi', endpoint: '', instance: '', token: '', allowedOrigins: [] });
  const result = await provider.send('grupo-de-teste@g.us', 'Teste sem envio real');
  assert.equal(result.success, false);
  assert.equal(fetchMock.mock.callCount(), 0, 'credenciais padrão não devem provocar envio');
});
