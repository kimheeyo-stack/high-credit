const CACHE = 'hc-v2';
const CORE = ['./index.html', './'];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()))
);

self.addEventListener('activate', e =>
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
);

self.addEventListener('fetch', e => {
  const isCDN = e.request.url.includes('cdn.jsdelivr.net') || e.request.url.includes('cdnjs.cloudflare.com');
  if (isCDN) {
    e.respondWith(
      fetch(e.request)
        .then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // index.html은 항상 네트워크 우선 → 업데이트 즉시 반영
  const isPage = e.request.mode === 'navigate' || e.request.url.endsWith('index.html') || e.request.url.endsWith('/');
  if (isPage) {
    e.respondWith(
      fetch(e.request)
        .then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // 나머지 파일은 캐시 우선
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res && res.status === 200) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
