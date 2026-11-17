/* Lucero FC · versión 1.0.0 */
const CACHE = "lucero-1.0.0";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
/* Los calendarios .ics no se guardan: siempre se piden a la red para que la suscripción esté al día */
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const url = new URL(r.url);
  if (url.pathname.endsWith(".ics")) return;
  if (url.origin === location.origin){
    /* Primero la red (para ver siempre los últimos datos); sin conexión, la copia guardada */
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match("./index.html"))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; })));
  }
});
