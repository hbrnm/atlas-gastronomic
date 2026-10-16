// Atlas Gastronomic — Service Worker for Offline Cooking Support
const CACHE_NAME = 'atlas-gastronomic-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/images/tagliatelle-ragu.jpg',
  '/images/risotto-milanese.jpg',
  '/images/boeuf-bourguignon.jpg',
  '/images/souffle-fromage.jpg',
  '/images/ciorba-radauteana.jpg',
  '/images/ratatouille-nicoise.jpg',
  '/images/coq-au-vin.jpg',
  '/images/tiramisu-trevisano.jpg',
  '/images/salata-vinete.jpg',
  '/images/shakshuka-maghreb.jpg',
  '/images/guacamole-mexicano.jpg',
  '/images/sarmale.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle recipe and editorial API requests: Network first, fallback to cache
  if (url.pathname.startsWith('/api/recipes') || url.pathname.startsWith('/api/editorial')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static images: Cache first, fallback to network
  if (url.pathname.startsWith('/images/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
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

  // Handle app assets: Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        if (response.status === 200 && (url.origin === location.origin || url.hostname.includes('fonts.'))) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
