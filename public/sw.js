const CACHE_NAME = 'igead-pwa-v4-public-only';
const scopeUrl = new URL(self.registration.scope);
const scoped = (path) => new URL(path, scopeUrl).href;
const PRECACHE_URLS = ['', 'index.html', 'manifest.json', 'pwa-192x192.png', 'pwa-512x512.png',
  'apple-touch-icon.png', 'data/pt_acf.json', 'data/en_kjv.json'];

function isPublicResource(url) {
  if (url.origin !== scopeUrl.origin || url.search || url.hash) return false;
  const root = scopeUrl.pathname;
  if (!url.pathname.startsWith(root)) return false;
  const path = url.pathname.slice(root.length);
  return PRECACHE_URLS.includes(path) ||
    /^assets\/[a-zA-Z0-9_./-]+\.(js|css|png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(path);
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(async (cache) => {
    await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(scoped(url))));
    await self.skipWaiting();
  }));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(async (names) => {
    await Promise.all(names.filter((name) => name.startsWith('igead-') && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  }));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  // APIs, consultas autenticadas e outros domínios nunca passam pelo Cache Storage.
  if (request.method !== 'GET' || request.headers.has('authorization') ||
      !isPublicResource(new URL(request.url))) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && response.type !== 'opaque') {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const fallback = await cache.match(scoped('index.html')) || await cache.match(scoped(''));
        if (fallback) return fallback;
      }
      return Response.error();
    }
  })());
});

// ==========================================
// SUPORTE A NOTIFICAÇÕES PUSH (WEB PUSH API)
// ==========================================

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'IGEAD-MT — Igreja Geração Eleita';
  const options = {
    body: data.body || 'Nova mensagem da Igreja Geração Eleita.',
    icon: data.icon || './assets/aistudio/Logotipo_gera__o_eleita_a16b7b59.png',
    badge: data.badge || './pwa-192x192.png',
    data: {
      url: data.url || './',
      timestamp: Date.now(),
      ...data
    },
    vibrate: [200, 100, 200],
    tag: data.tag || 'igead-notification',
    renotify: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || './';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate?.(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Suporte a mensagens do cliente para disparo de notificação via Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});

