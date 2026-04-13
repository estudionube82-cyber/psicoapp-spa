// Service Worker desactivado intencionalmente.
// No registra caché, no fuerza activación y se desregistra solo.

self.addEventListener('install', () => {
  console.log('[SW] deshabilitado');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.registration.unregister());
});
