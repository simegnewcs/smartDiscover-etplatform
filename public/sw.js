const CACHE_NAME = 'helloet-pwa-v1.0.0'
const OFFLINE_URL = '/offline.html'

// Assets to pre-cache on service worker install
const PRECACHE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
  '/site.webmanifest',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/HELLOTLOGO.png',
  '/logo-icon.svg',
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Precache warning:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate event - clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[PWA SW] Removing outdated cache:', name)
            return caches.delete(name)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Listen for message from client (e.g. manual skip waiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const request = event.request

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (!url.protocol.startsWith('http')) return

  // NEVER cache API, NextAuth, or admin mutation endpoints
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.includes('/api/auth')
  ) {
    return
  }

  // 1. Navigation requests (HTML pages) -> Network-First, fallback to offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Clone and cache the successful page for fast return
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return networkResponse
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            return cachedResponse
          }
          const offlineFallback = await caches.match(OFFLINE_URL)
          return offlineFallback || new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
        })
    )
    return
  }

  // 2. Static assets (images, fonts, scripts, stylesheets, icons) -> Stale While Revalidate
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/uploads/') ||
    /\.(png|jpg|jpeg|svg|webp|gif|ico|woff|woff2|ttf|css|js)$/i.test(url.pathname)

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone)
              })
            }
            return networkResponse
          })
          .catch(() => cachedResponse)

        return cachedResponse || fetchPromise
      })
    )
    return
  }
})
