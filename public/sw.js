const CACHE_NAME = 'igead-pwa-v3';

// Recursos estáticos fundamentais para pré-carregamento offline
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './pwa-192x192.png',
  './pwa-512x512.png',
  './apple-touch-icon.png',
  './data/pt_acf.json',
  './data/en_kjv.json',
  './assets/aistudio/Logotipo_gera__o_eleita_a16b7b59.png',
  './assets/aistudio/2026-01-24_122424.pdf_93f47d23.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pré-carrega cada recurso de forma resiliente
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[PWA SW] Aviso ao pré-carregar:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Apenas requisições GET são cacheadas
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Ignora APIs dinâmicas externas (YouTube Data API, estatísticas em tempo real, etc.)
  if (
    (url.hostname.includes('googleapis.com') && !url.hostname.includes('fonts.googleapis.com')) ||
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('googlevideo.com')
  ) {
    return;
  }

  // Módulos Vite e código-fonte em desenvolvimento: Sempre Network-First para evitar código obsoleto
  if (
    url.pathname.includes('/src/') ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@fs/') ||
    url.pathname.includes('/node_modules/')
  ) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Navegação HTML: Network-first com fallback para index.html em cache offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match('./index.html') || caches.match('./');
          });
        })
    );
    return;
  }

  // Dados da Bíblia (JSON) e assets estáticos: Cache-first com revalidação em segundo plano
  if (
    url.pathname.endsWith('.json') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?|css|js)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalida em segundo plano quando conectado
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Estratégia padrão: Network primeiro, com fallback para cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
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

