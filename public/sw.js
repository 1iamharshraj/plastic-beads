/* BeadFactory Pro service worker.
 * - App shell & static assets: cache-first (hashed by the bundler, safe to keep).
 * - API reads (GET /api/*): network-first, falling back to the last-fetched
 *   response so recently viewed data stays visible offline.
 * - API writes: never cached — they just fail offline and the UI reports it.
 */
const STATIC_CACHE = 'bf-static-v1';
const API_CACHE = 'bf-api-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(['/', '/manifest.webmanifest'])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => ![STATIC_CACHE, API_CACHE].includes(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* API: network-first with cache fallback for reads */
  if (url.pathname.startsWith('/api/')) {
    if (request.method !== 'GET') return;
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(API_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              new Response(JSON.stringify({ error: 'offline' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }),
          ),
        ),
    );
    return;
  }

  /* Navigations: network-first, fall back to cached shell (SPA offline) */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put('/', clone));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/'))),
    );
    return;
  }

  /* Static assets: cache-first, then network (and cache the result) */
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          if (res.ok && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/fonts/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/media/'))) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        }),
    ),
  );
});
