const CACHE_NAME = 'ayurvani-static-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './ThankYou.html',
  './sw.js',
  './Image/Hook.avif',
  './Image/Intro.avif',
  './Image/Pain1.avif',
  './Image/Pain2.avif',
  './Image/Pain3.avif',
  './Image/Pain4.avif',
  './Image/Pain5.avif',
  './Image/Pain6.avif',
  './Image/Pain7.avif',
  './Image/Pain8.avif',
  './Image/Doctor.avif',
  './Image/Trust.avif',
  './Image/speak.avif'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  const isLocalAsset = url.origin === self.location.origin;
  const isGoogleFont = url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';
  const isOrderEndpoint = url.href.includes('script.google.com/macros');

  if (isOrderEndpoint) {
    return;
  }

  if (!isLocalAsset && !isGoogleFont) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const networkFetch = fetch(request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status >= 400) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
