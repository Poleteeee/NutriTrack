self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('nutritrack-v1').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/css/style.css',
      '/js/app.js',
      '/js/storage.js',
      '/js/calculator.js',
      '/js/ui.js'
    ]))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});