// HOTFIX de emergencia:
// Este Service Worker se auto-desactiva para estabilizar la SPA.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    } catch (err) {
      console.warn('[SW] Error limpiando cachés:', err);
    }

    await self.registration.unregister();
    await self.clients.claim();

    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });

    for (const client of clients) {
      client.navigate(client.url);
    }
  })());
});
