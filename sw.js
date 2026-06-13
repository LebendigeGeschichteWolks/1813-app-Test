const CACHE_NAME = 'lww-app-v1';
const ASSETS_TO_CACHE = [
    './',
    './Appprot.html',
    './images/paper-texture.webp',
    './images/fallback/bildfb.webp',
    './images/fallback/kartefb.webp'
    // Hier können Sie später weitere CSS- oder JS-Dateien hinzufügen
];

// 1. Installation: Statische Assets in den Cache laden
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('ServiceWorker: Cache geöffnet und Assets geladen');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. Aktivierung: Alte Caches löschen, falls die Version sich ändert
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});

// 3. Fetch: Die "Intelligente" Logik für Netzwerkzugriffe
self.addEventListener('fetch', (event) => {
    // Spezial-Logik für API-Daten (Google Sheets)
    // Wir versuchen zuerst das Netzwerk, bei Fehler den Cache
    if (event.request.url.includes('script.google.com')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    } else {
        // Logik für alles andere (Bilder, HTML, CSS): Cache zuerst
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});