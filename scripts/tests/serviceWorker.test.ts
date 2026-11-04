import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('service worker não intercepta APIs, autorização, consultas ou outros domínios', async () => {
  const listeners = new Map<string, (event: any) => void>();
  const script = await readFile(new URL('../../public/sw.js', import.meta.url), 'utf8');
  const context = vm.createContext({ URL, Response, self: {
    registration: { scope: 'https://site.test/SITE_IGEAD/' },
    addEventListener: (name: string, fn: (event: any) => void) => listeners.set(name, fn),
  }, caches: {}, fetch: async () => new Response('public') });
  vm.runInContext(script, context);
  for (const [url, headers] of [
    ['https://database.test/rest/v1/whatsapp_automation_settings', {}],
    ['https://site.test/SITE_IGEAD/api/profile', {}],
    ['https://site.test/SITE_IGEAD/data/pt_acf.json', { authorization: 'Bearer test' }],
    ['https://site.test/SITE_IGEAD/index.html?token=test', {}],
    ['https://site.test/other-app/assets/app.js', {}],
  ] as const) {
    let intercepted = false;
    listeners.get('fetch')!({ request: new Request(url, { headers }), respondWith: () => { intercepted = true; } });
    assert.equal(intercepted, false, url);
  }
});

test('service worker mantém Bíblia pública offline e remove somente caches IGEAD legados', async () => {
  const listeners = new Map<string, (event: any) => void>();
  const removed: string[] = [];
  const cache = { match: async () => new Response('["bible-fixture"]') };
  const context = vm.createContext({ URL, Response, self: {
    registration: { scope: 'https://site.test/SITE_IGEAD/' }, clients: { claim: async () => {} },
    addEventListener: (name: string, fn: (event: any) => void) => listeners.set(name, fn),
  }, caches: {
    open: async () => cache,
    keys: async () => ['igead-pwa-v3', 'other-app-cache', 'igead-pwa-v4-public-only'],
    delete: async (name: string) => { removed.push(name); return true; },
  }, fetch: async () => { throw new Error('offline'); } });
  vm.runInContext(await readFile(new URL('../../public/sw.js', import.meta.url), 'utf8'), context);
  let operation: Promise<Response> | undefined;
  listeners.get('fetch')!({ request: new Request('https://site.test/SITE_IGEAD/data/pt_acf.json'),
    respondWith: (value: Promise<Response>) => { operation = value; } });
  assert.equal(await (await operation!).text(), '["bible-fixture"]');
  let activation: Promise<void> | undefined;
  listeners.get('activate')!({ waitUntil: (value: Promise<void>) => { activation = value; } });
  await activation;
  assert.deepEqual(removed, ['igead-pwa-v3']);
});
