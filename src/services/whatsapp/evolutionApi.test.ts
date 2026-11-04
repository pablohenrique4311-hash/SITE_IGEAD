import test from 'node:test';
import assert from 'node:assert/strict';
import { Gateway } from '../../../supabase/functions/_shared/gateway';

test('Evolution envia payload e apikey no servidor e exige ID do provedor', async () => {
  const http: typeof fetch = async (url, init) => {
    assert.equal(String(url), 'https://evolution.test/message/sendText/church');
    assert.equal(new Headers(init?.headers).get('apikey'), 'synthetic');
    assert.deepEqual(JSON.parse(String(init?.body)), { number: '12345@g.us', text: 'Sintética' });
    return new Response('{"key":{"id":"evolution-message"}}');
  };
  const gateway = new Gateway({ type: 'evolution', endpoint: 'https://evolution.test', instance: 'church', token: 'synthetic', allowedOrigins: ['https://evolution.test'] }, http);
  assert.equal((await gateway.send('12345@g.us', 'Sintética')).providerMessageId, 'evolution-message');
});
