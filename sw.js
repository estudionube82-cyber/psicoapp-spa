self.addEventListener('install', () => {
  console.log('[SW] deshabilitado');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.registration.unregister());
});
});
