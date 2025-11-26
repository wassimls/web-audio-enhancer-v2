// Service Worker for Audio Enhancer PWA
// Version: 1.0.0

const CACHE_VERSION = 'v1.0.0';
const CACHE_STATIC = 'audio-enhancer-static-v1';
const CACHE_DYNAMIC = 'audio-enhancer-dynamic-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/css/variables.css',
    '/css/styles.css',
    '/css/animations.css',
    '/js/app.js',
    '/js/audio-processor.js',
    '/js/filters.js',
    '/js/noise-reduction.js',
    '/js/ui-controller.js',
    '/js/presets.js',
    '/js/pwa-manager.js',
    '/js/utils.js',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...', CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((err) => {
                console.error('[SW] Failed to cache static assets:', err);
            })
    );

    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...', CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_STATIC && cacheName !== CACHE_DYNAMIC) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );

    // Claim all clients immediately
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip audio file uploads (POST requests)
    if (request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached response and update in background
                    updateCache(request);
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then((response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache dynamic content
                        caches.open(CACHE_DYNAMIC)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Network failed, return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// Update cache in background (stale-while-revalidate)
function updateCache(request) {
    fetch(request)
        .then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
                return;
            }

            caches.open(CACHE_STATIC)
                .then((cache) => {
                    cache.put(request, response);
                });
        })
        .catch(() => {
            // Network failed, ignore
        });
}

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys()
                .then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => caches.delete(cacheName))
                    );
                })
                .then(() => {
                    return self.clients.matchAll();
                })
                .then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({ action: 'cacheCleared' });
                    });
                })
        );
    }
});

// Background sync (if supported)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-audio-settings') {
        event.waitUntil(syncSettings());
    }
});

async function syncSettings() {
    // Sync user settings or presets when back online
    console.log('[SW] Syncing settings...');
    // Implementation depends on backend
}
