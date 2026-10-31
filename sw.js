// Bump this whenever you change any file, or the phone keeps the old copy.
const CACHE = 'vdc-v45';
const ASSETS = ['./','./index.html','./report.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-192-maskable.png','./icon-512-maskable.png'];
const FONT_HOSTS = ['fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (FONT_HOSTS.includes(url.hostname)) {
    // Font: cache the first time it loads online, then serve offline.
    e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }))).catch(() => new Response('', { status: 504 })));
    return;
  }
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('/report.html')) {
    // The page friends open from shared links: always try the newest version first, saved copy only when offline.
    e.respondWith(fetch(e.request, { cache:'reload' }).then(r => {
      if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./report.html', copy)); }
      return r;
    }).catch(() => caches.match('./report.html')));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch:true }).then(hit => hit || fetch(e.request).catch(() => {
    if (e.request.mode === 'navigate') return caches.match('./index.html');
  })));
});
