/**
 * sw.js — service worker: aplikacja działa bez internetu i da się ją
 * zainstalować jak zwykły program.
 *
 * Strategia jest dobrana pod to, czym ta aplikacja JEST — jednym plikiem bez
 * backendu, który zmienia się tylko przy wdrożeniu:
 *
 *   nawigacja (wejście na stronę)  → najpierw sieć, cache jako zapas
 *       Dzięki temu po `git push` widać nową wersję od razu, a w metrze
 *       albo w samolocie i tak się otworzy.
 *
 *   reszta (ikony, manifest)       → cache first z odświeżaniem w tle
 *       Natychmiastowe ładowanie, a nowa wersja wskakuje po cichu.
 *
 *   ścieżki z /src/                → zawsze z sieci, nigdy z cache
 *       To tryb deweloperski (`npm run dev`). Bez tego wyjątku edycja
 *       modułu i odświeżenie pokazywałyby starą wersję, co jest najszybszą
 *       drogą do znienawidzenia service workerów.
 *
 * Wersja jest podmieniana przez tools/build.mjs — zmiana wersji to nowa nazwa
 * cache'u, czyli automatyczne sprzątanie starych plików przy aktywacji.
 */

const VERSION = '__STDMEAL_VERSION__';
const CACHE = `stdmeal-${VERSION}`;

/** Minimum, które musi być dostępne offline. */
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Pojedynczo, a nie addAll: jeden brakujący plik nie może wywrócić
      // całej instalacji (np. w trybie deweloperskim, gdzie ikon może nie być).
      await Promise.allSettled(
        PRECACHE.map(async (url) => {
          const response = await fetch(new Request(url, { cache: 'reload' }));
          if (response.ok) await cache.put(url, response);
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith('stdmeal-') && name !== CACHE).map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

/** Strona pozwala wymusić przejęcie przez nową wersję („odśwież" w powiadomieniu). */
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Tryb deweloperski — moduły źródłowe zawsze świeże.
  if (url.pathname.includes('/src/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) ?? (await cache.match('./index.html')) ?? (await cache.match('./')) ?? Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached ?? (await network) ?? Response.error();
}
