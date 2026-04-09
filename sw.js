const CACHE_VERSION = 'psicoapp-v5';
const STATIC_ASSETS = [
  '/config.js',
  '/psicoapp-limites.js',
  '/logo-psicoapp.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-scanner.png',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// HTML y Supabase → siempre red (datos frescos)
// Assets estáticos → cache first
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (
    url.includes('.html') ||
    url.includes('supabase.co') ||
    url.includes('functions/v1')
  ) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
      return resp;
    }))
  );
});
