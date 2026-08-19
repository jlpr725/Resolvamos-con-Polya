/* Service worker: la app funciona sin internet una vez instalada. */
const CACHE = 'polya-v14';

const ESENCIALES = [
  './', './index.html',
  './css/estilos.css',
  './js/datos.js', './js/sonido.js', './js/progreso.js', './js/app.js',
  './assets/audio/musica-fondo.mp3',
  './assets/audio/festejo.mp3',
  // Las voces se descargan al vuelo la primera vez que suenan y quedan
  // guardadas. No van aquí para que la app instale rápido aunque falten.
  './manifest.webmanifest',
  './icons/icono-192.png', './icons/icono-512.png',
  './assets/img/logo.webp', './assets/img/polya.webp', './assets/img/martin.webp',
  './assets/img/background.webp', './assets/img/tesoro.webp',
  './assets/img/avance-llamada.webp',
  './assets/img/cofre_abierto.webp',

  // Portadas de los cuentos
  './assets/img/portada_caperucita.webp',
  './assets/img/portada_patito.webp',

  // Escenas de Caperucita Roja: _a = historia, _b = problema
  './assets/img/cap1_a.webp', './assets/img/cap1_b.webp',
  './assets/img/cap2_a.webp', './assets/img/cap2_b.webp',
  './assets/img/cap3_a.webp', './assets/img/cap3_b.webp',
  './assets/img/cap4_a.webp', './assets/img/cap4_b.webp',
  './assets/img/cap5_a.webp', './assets/img/cap5_b.webp',

  // Escenas de El Patito Feo
  './assets/img/pat1_a.webp', './assets/img/pat1_b.webp',
  './assets/img/pat2_a.webp', './assets/img/pat2_b.webp',
  './assets/img/pat3_a.webp', './assets/img/pat3_b.webp',
  './assets/img/pat4_a.webp', './assets/img/pat4_b.webp',
  './assets/img/pat5_a.webp', './assets/img/pat5_b.webp',
  './assets/img/llave.svg'
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
