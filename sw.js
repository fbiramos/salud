// Service Worker Básico
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
});

self.addEventListener('fetch', (event) => {
  // Por ahora, solo pasamos la solicitud a la red.
  event.respondWith(fetch(event.request));
});