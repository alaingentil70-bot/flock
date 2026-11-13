// Offline helper for the installed app (GitHub Pages build only).
// The app page: always try the internet first so updates show at once; use the saved copy offline.
// Pinned library and font files never change, so they are served from the saved copy first.
// Farm records are not touched here: Firebase keeps its own offline copy.
const CACHE = "flock-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
const save = (req, res) => { if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; };
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin === self.location.origin) {
    e.respondWith(fetch(req).then(r => save(req, r)).catch(() =>
      caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("./"))));
    return;
  }
  if (u.hostname === "cdnjs.cloudflare.com" || u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => save(req, res))));
  }
});
