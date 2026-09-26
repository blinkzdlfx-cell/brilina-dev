const CACHE_NAME = 'brilina-dev-v1';
const PUBLIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const PUBLIC_ROUTES = [
  '/',
  '/projects',
  '/method',
  '/about',
  '/contact'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PUBLIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => url.pathname === route || url.pathname.startsWith('/projects/')
  );

  if (url.pathname.startsWith('/admin')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response('Offline - Admin requires connectivity', { status: 503 });
      })
    );
    return;
  }

  if (isPublicRoute || url.pathname === '/' || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        }).catch(() => {
          return cached || new Response('Offline', { status: 503 });
        });

        return cached || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(fetch(request));
});
