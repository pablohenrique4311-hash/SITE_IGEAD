import test from 'node:test';
import assert from 'node:assert/strict';
import { getWhatsAppAdminStatus } from '../../constants/authConfig';

test('permissão vem do banco, inclusive negação e falha HTTP', async (t) => {
  let allowed = true;
  let status = 200;
  t.mock.method(globalThis, 'fetch', async (url: RequestInfo | URL) => {
    assert.ok(String(url).includes('/rpc/is_whatsapp_admin'));
    return new Response(JSON.stringify(allowed), { status });
  });
  assert.equal(await getWhatsAppAdminStatus(), true);
  allowed = false;
  assert.equal(await getWhatsAppAdminStatus(), false);
  status = 503;
  assert.equal(await getWhatsAppAdminStatus(), false);
});
