/* Tukosoko POS service worker.
 * Must be served from the site root (/sw.js) so its scope covers the whole app.
 * Static assets: cache-first. Pages: network-first with offline fallback.
 * POST/AJAX requests are never cached — a POS must never show stale sales data. */
const VERSION = 'tks-pos-v1';
const SHELL = ['/offline.html', '/pwa/tukosoko-theme.css', '/pwa/tukosoko-pwa.js', '/pwa/bt-print.js', '/pwa/icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const isStatic = (url) =>
  /\.(css|js|woff2?|ttf|png|jpe?g|svg|ico|webp)$/i.test(url.pathname) || url.hostname.includes('fonts.g');

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (isStatic(url)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok && (url.origin === location.origin || url.hostname.includes('fonts.g'))) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }))
    );
    return;
  }

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
  }
});
