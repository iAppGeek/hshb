const CACHE_NAME = 'hshb-portal-v3'

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

  // Navigation requests (HTML pages): stale-while-revalidate
  // Serve cached HTML instantly, then update cache in the background.
  // This eliminates the blank screen on PWA cold-start.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((response) => {
            const clone = response.clone()
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone))
            return response
          })
          .catch(() => cached || caches.match('/portal-offline.html'))

        return cached || fetchPromise
      }),
    )
    return
  }

  // Fonts and CSS only: cache-first (content-hashed, immutable, small set)
  // JS chunks are already handled by browser HTTP cache (Cache-Control: immutable)
  if (
    url.pathname.startsWith('/_next/static/media/') ||
    url.pathname.startsWith('/_next/static/css/')
  ) {
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

self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : {}
  const title = payload.title ?? 'Staff Portal'
  const body = payload.body ?? ''
  const data = payload.data ?? {}
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/portal-icon-192.png',
      badge: '/icons/portal-icon-192.png',
      data,
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/portal/reports'
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes('/portal') && 'focus' in client) {
            client.focus()
            return client.navigate(url)
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      }),
  )
})
