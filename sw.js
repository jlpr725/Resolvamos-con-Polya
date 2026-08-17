/* Service worker: la app funciona sin internet una vez instalada. */
const CACHE = 'polya-v7';

const ESENCIALES = [
  './', './index.html',
  './css/estilos.css',
  './js/datos.js', './js/sonido.js', './js/progreso.js', './js/app.js',
  './assets/audio/musica-fondo.mp3',
  './manifest.webmanifest',
  './icons/icono-192.png', './icons/icono-512.png',
  './assets/img/logo.webp', './assets/img/polya.webp', './assets/img/martin.webp',
  './assets/img/background.webp', './assets/img/tesoro.webp',
  './assets/img/portada_cuento.webp', './assets/img/para_cuento.webp',
  './assets/img/avance-llamada.webp',
  './assets/img/llave.svg', './assets/img/llave-vacia.svg'
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ESENCIALES))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fuentes e iconos de Google: caché primero. Sin esto, al abrir la app
  // sin conexión los iconos se dibujarían como texto y se rompería el diseño.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    ev.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
        return res;
      }).catch(() => hit))
    );
    return;
  }

  if (url.origin !== location.origin) return;

  // Navegación: red primero, caché de respaldo.
  if (req.mode === 'navigate') {
    ev.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Recursos: caché primero, y se guarda lo nuevo (incluido el audio).
  ev.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      }).catch(() => hit);
    })
  );
});
