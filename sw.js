/* Parcialito: shell precargado y datos con stale-while-revalidate. */
const CACHE = 'parcialito-shell-__VERSION__';
const SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/banco-temas.js',
  './js/store.js',
  './js/sonido.js',
  './js/confeti.js',
  './js/ranking.js',
  './js/dispositivo.js',
  './js/telemetria.js',
  './js/actividad.js',
  './js/replicacion.js',
  './js/cuadro.js',
  './js/horquilla.js',
  './js/bases.js',
  './js/crucigrama.js',
  './js/operones.js',
  './js/comunicacion.js',
  './js/proteina-g.js',
  './js/lac-vs-trp.js',
  './js/comparador-comunicacion.js',
  './js/comparadores.js',
  './js/lab.js',
  './js/telomeros.js',
  './js/atlas-cromosomas.js',
  './js/guia-kuhn.js',
  './js/deduccion-natural.js',
  './js/formalizacion.js',
  './js/envios.js',
  './js/composicion-quimica.js',
  './js/spot-fase.js',
  './js/transcripcion.js',
  './js/traduccion.js',
  './js/cromosomas.js',
  './js/mitosis.js',
  './js/meiosis.js',
  './js/cantidad-adn.js',
  './js/comparador-division.js',
  './js/calculadora-division.js',
  './js/visual-division.js',
  './js/lab-gametogenesis.js',
  './js/lab-genetica.js',
  './js/lab-replicacion.js',
  './manifest.json',
  './data/index.json',
  './icons/parcialito-192.png',
  './icons/parcialito-512.png',
  './fonts/Inter-latin-variable.woff2',
];
const PREFIX = 'parcialito-shell-';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL.map((path) => new Request(new URL(path, self.registration.scope), { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(PREFIX) && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function esRecursoActualizable(url) {
  const scopePath = new URL(self.registration.scope).pathname;
  const ruta = url.pathname;
  return ruta.startsWith(`${scopePath}data/`) || ruta.startsWith(`${scopePath}assets/`);
}

function actualizarEnFondo(request, cache, event) {
  const actualizacion = fetch(request).then((response) => {
    if (response.ok && response.type === 'basic') return cache.put(request, response.clone()).then(() => response);
    return response;
  });
  event.waitUntil(actualizacion.catch(() => {}));
  return actualizacion;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.hostname.endsWith('.supabase.co') || url.hostname === 'supabase.co') return;
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;

  if (esRecursoActualizable(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const guardada = await cache.match(request);
      const actualizacion = actualizarEnFondo(request, cache, event).catch(() => null);
      if (guardada) return guardada;
      const respuesta = await actualizacion;
      return respuesta || new Response('Este contenido todavía no está disponible sin conexión.', {
        status: 503,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Se ignora ?v= porque versionar.py cambia esos parámetros en cada publicación.
    const shell = await cache.match(request, { ignoreSearch: true });
    if (shell) return shell;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') event.waitUntil(cache.put(request, response.clone()).catch(() => {}));
      return response;
    } catch {
      if (request.mode === 'navigate') {
        const inicio = await cache.match(new URL('./index.html', self.registration.scope).href);
        if (inicio) return inicio;
      }
      return new Response('Sin conexión. Abrí una sección que ya se haya cargado o volvé a conectarte.', {
        status: 503,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  })());
});
