const CACHE_NAME = 'hshb-portal-v1'
const PRECACHE_URLS = [
  '/manifest.portal.json',
  '/portal-offline.html',
  '/icons/portal-icon-192.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Never cache auth endpoints or API routes
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/auth/')) {
    return
  }

  // Navigation requests (HTML pages): network-first, offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/portal-offline.html')),
    )
    return
  }

  // Static assets (_next/static): cache-first (content-hashed, immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            const clone = response.clone()
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone))
            return response
          }),
      ),
    )
    return
  }

  // Everything else: network-first with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  )
})
