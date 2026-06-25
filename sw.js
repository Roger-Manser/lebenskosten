/* Lebenskosten Service Worker */
const CACHE = 'lebenskosten-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      // einzeln cachen, damit eine fehlende Datei nicht den ganzen Install abbricht
      for (const a of ASSETS) {
        try { await cache.add(a); } catch (err) { /* still */ }
      }
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // GitHub-API-Aufrufe nie cachen – immer frisch holen (für aktuellen Import)
  if (url.hostname === 'api.github.com') {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }
  // App-Dateien: Cache zuerst, Netz als Fallback
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      if (e.request.method === 'GET' && resp.ok && url.origin === location.origin) {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
