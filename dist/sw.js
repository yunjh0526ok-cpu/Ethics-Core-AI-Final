/** App shell은 캐시하지 않음 — 메인 주소 접속 시 항상 최신 index를 받도록 함 */
const CACHE_NAME = 'eca-assets-v4';
const NETWORK_FIRST_PATHS = ['/manifest.webmanifest', '/pwa-icons/'];

self.addEventListener('install', (event) => {
  event.waitUntil(Promise.resolve().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Service Worker 스크립트 자체는 캐시하지 않음
  if (url.pathname === '/sw.js') return;

  /** 최상위 문서·SPA 내비게이션: 항상 네트워크 우선 → 배포 반영 즉시 */
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => caches.match(event.request)),
    );
    return;
  }

  const shouldUseNetworkFirst = NETWORK_FIRST_PATHS.some((path) => url.pathname.startsWith(path));
  if (shouldUseNetworkFirst) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  /** Vite 해시 번들: 네트워크 우선(캐시는 폴백·오프라인용) */
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
