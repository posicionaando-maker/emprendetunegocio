const CACHE_NAME = 'mente-en-marcha-v3';
const ARCHIVOS_FIJOS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/libros/tracy-emprende.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalación: guarda todos los archivos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('📦 Cacheando archivos esenciales');
      return cache.addAll(ARCHIVOS_FIJOS);
    })
  );
  // Activar inmediatamente sin esperar
  self.skipWaiting();
});

// Activación: limpia cachés viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Estrategia: cache first, luego red (para offline total)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      // Si no está en caché, intenta red (pero offline fallará)
      return fetch(event.request).catch(() => {
        // Opcional: página de error offline personalizada
        return new Response('🌐 Sin conexión. La app requiere instalación completa.', {
          status: 503,
          statusText: 'Offline'
        });
      });
    })
  );
});
