const CACHE_NAME = 'nikosoko-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
  '/apple-touch-icon.png'
];

// Installation: Cache core shell assets resiliently
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((url) => cache.add(url).catch((err) => console.warn('PWA: Failed to cache', url, err)))
      );
    })
  );
});

// Activation: Clean old caches and claim control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate with network fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: Never cache or intercept any API requests
  if (url.pathname.startsWith('/api') || url.pathname.includes('/api/')) {
    return;
  }

  if (event.request.method !== 'GET') return;

  // Link pages (visitor pass, guard check, place page, document view) always come fresh from the server.
  if (/^\/(g|v|q|d)\//.test(url.pathname)) return;

  // Opening the app: take the newest copy when online, and fall back to the cached one offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html').then((r) => r || caches.match('/'))));
    return;
  }

  // Skip browser extension requests or cross-origin POSTs
  if (url.origin !== location.origin && !url.href.includes('fonts.googleapis.com') && !url.href.includes('cdn.tailwindcss.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
