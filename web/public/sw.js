const CACHE_NAME = "mihon-v2";
const STATIC_ASSETS = ["/", "/library", "/browse", "/history", "/updates", "/downloads", "/settings"];
const IMAGE_CACHE = "mihon-images-v1";
const API_CACHE = "mihon-api-v1";

// Install: cache shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {})
    ).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== IMAGE_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // MangaDex cover images: cache-first with long TTL
  if (url.hostname === "uploads.mangadex.org") {
    e.respondWith(cacheFirst(e.request, IMAGE_CACHE));
    return;
  }

  // MangaDex API: network-first with fallback
  if (url.hostname === "api.mangadex.org") {
    e.respondWith(networkFirst(e.request, API_CACHE));
    return;
  }

  // Chapter page images from at-home servers: cache-first
  if (url.pathname.startsWith("/data/") || url.pathname.startsWith("/data-saver/")) {
    e.respondWith(cacheFirst(e.request, IMAGE_CACHE));
    return;
  }

  // Next.js app shell: network-first
  if (e.request.mode === "navigate") {
    e.respondWith(networkFirst(e.request, CACHE_NAME));
    return;
  }

  // Next.js JS/CSS chunks: network-first so rebuilt code is never stale
  // (images/fonts under _next/static can be cache-first since they're content-hashed)
  if (url.pathname.startsWith("/_next/static/")) {
    if (url.pathname.includes("/media/") || url.pathname.includes("/fonts/")) {
      e.respondWith(cacheFirst(e.request, CACHE_NAME));
    } else {
      e.respondWith(networkFirst(e.request, CACHE_NAME));
    }
    return;
  }

  // Default: network
  e.respondWith(fetch(e.request).catch(() => new Response("Offline", { status: 503 })));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Not available offline", { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
}
