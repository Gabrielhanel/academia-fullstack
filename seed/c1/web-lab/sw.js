const V = 'app-v1';
const SHELL = ['/shell.txt'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('app-') && k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  if (u.pathname === '/shell.txt') { e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request))); return; } // cache-first
  if (u.pathname.startsWith('/api/net/')) { // network-first
    e.respondWith(fetch(e.request).then((res) => { if (!res.ok) throw new Error('HTTP ' + res.status); const cp = res.clone(); caches.open(V).then((c) => c.put(e.request, cp)); return res; }).catch(() => caches.match(e.request).then((r) => r || new Response('offline', { status: 503 }))));
    return;
  }
  if (u.pathname.startsWith('/api/swr/')) { // stale-while-revalidate
    e.respondWith(caches.open(V).then(async (c) => { const hit = await c.match(e.request); const rede = fetch(e.request).then((res) => { if (res.ok) c.put(e.request, res.clone()); return res; }).catch(() => hit); return hit || rede; }));
  }
});
self.addEventListener('message', (e) => { if (e.data === 'ping') e.source.postMessage('pong de ' + V); });
