// PoojaSathi Service Worker — offline-friendly PWA shell caching
const CACHE = "poojasathi-v3";
const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE).catch(() => null))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Only handle same-origin GET requests; ignore dev HMR + fonts (handled by browser cache).
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/@") || url.pathname.includes("hot-update"))
    return;

  // Network-first for navigation/HTML, cache fallback when offline.
  if (
    request.mode === "navigate" ||
    request.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches
            .open(CACHE)
            .then((c) => c.put(request, copy))
            .catch(() => null);
          return res;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match("/index.html")),
        ),
    );
    return;
  }

  // Stale-while-revalidate for static assets.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches
              .open(CACHE)
              .then((c) => c.put(request, copy))
              .catch(() => null);
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
