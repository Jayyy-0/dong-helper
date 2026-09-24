// Offline support: static files cache-first, rates.json network-first.
const CACHE = "dh-v4";
const ASSETS = ["./", "index.html", "style.css", "app.js", "config.js", "shared.js", "rates.json", "icon.svg", "manifest.webmanifest"];

self.addEventListener("install", (e) => {
  // cache: "reload" bypasses the browser HTTP cache so a new version never stores stale files.
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  if (url.pathname.endsWith("rates.json")) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put("rates.json", copy));
        return res;
      }).catch(() => caches.match("rates.json"))
    );
    return;
  }

  // Stale-while-revalidate: answer from cache instantly, refresh the copy in the
  // background so edits reach returning visitors on their next visit.
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(e.request, { ignoreSearch: true }).then((hit) => {
        const net = fetch(e.request, { cache: "no-cache" }).then((res) => {
          if (res.ok) c.put(url.origin + url.pathname, res.clone()); // one entry per page, not per ?a=…
          return res;
        });
        if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
        return net;
      })
    )
  );
});
