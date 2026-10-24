/**
 * Registro do Service Worker do PWA da IGEAD-MT
 * Suporta dinamicamente subcaminhos como GitHub Pages (/SITE_IGEAD/) e domínio raiz.
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const rawBase = import.meta.env.BASE_URL || '/';
      const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
      const swUrl = `${baseUrl}sw.js`;

      navigator.serviceWorker
        .register(swUrl, { scope: baseUrl })
        .then((registration) => {
          console.log('[PWA] Service Worker ativo no escopo:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Não foi possível registrar o Service Worker:', error);
        });
    });
  }
}
