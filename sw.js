self.addEventListener('install', e => {
    e.waitUntil(
        caches.open('mrsholees-cache').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.min.css',
                '/script.js'
            ]);
        })
    );
});
