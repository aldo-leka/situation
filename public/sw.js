const CACHE_NAME = "situation-v2";

self.addEventListener("install", (event) => {
  // Take over immediately, don't wait for old SW to die
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/api/status"]);
    })
  );
});

self.addEventListener("activate", (event) => {
  // Claim all tabs immediately so the new SW takes effect without a reload
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Purge all old caches
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((n) => n !== CACHE_NAME)
            .map((n) => caches.delete(n))
        )
      ),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Network-first: try network, fall back to cache (offline support)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Got a good response, update the cache for offline use
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network failed (offline), serve from cache
        return caches.match(request);
      })
  );
});
