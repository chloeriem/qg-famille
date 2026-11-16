// Garde une copie de la page pour l'ouvrir sans réseau. Les données, elles, sont gérées par Firebase.
const CACHE = "qg-famille-v5";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  const ok = u.origin === self.location.origin || u.host === "www.gstatic.com" || u.host === "fonts.gstatic.com" || (u.host === "fonts.googleapis.com");
  if (!ok) return;
  e.respondWith(
    fetch(e.request).then((r) => { const copie = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copie)); return r; })
      .catch(() => caches.match(e.request))
  );
});
