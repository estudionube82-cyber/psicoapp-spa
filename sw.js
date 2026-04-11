const CACHE_VERSION = 'psicoapp-v6';
const CACHE_NAME = `${CACHE_VERSION}-runtime`;

function isSupabaseRequest(url) {
  return url.includes('supabase.co') || url.includes('/functions/v1');
}

function isNetworkFirst(request) {
  if (request.mode === 'navigate') return true;
  const dest = request.destination;
  return dest === 'document' || dest === 'script' || dest === 'style';
}

function isStaleWhileRevalidate(request) {
  const dest = request.destination;
  return dest === 'image' || dest === 'font';
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = request.url;
  if (isSupabaseRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  if (isNetworkFirst(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  if (isStaleWhileRevalidate(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
