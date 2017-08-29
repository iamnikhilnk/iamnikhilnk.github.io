this.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open('bible_v1.3').then(function(cache) {
			return cache.addAll([
				'/',
				'bible.html',
				'manifest.json',
				'favicon.ico',
				'css/bible.css',
				'css/font-awesome.min.css',
				'js/jquery-1.8.3.js',
				'js/responsivevoice.js',
				'js/storage.js',
				'js/bible.js',
				'media/network.error.mp3',
				'media/instructions.mp3',
				'icons/android-icon-192x192.png',
				'icons/android-icon-36x36.png',
				'icons/android-icon-48x48.png',
				'icons/apple-icon-114x114.png',
				'icons/apple-icon-120x120.png',
				'icons/apple-icon-144x144.png',
				'icons/apple-icon-152x152.png',
				'icons/apple-icon-180x180.png',
				'icons/apple-icon-57x57.png',
				'icons/apple-icon-60x60.png',
				'icons/apple-icon-72x72.png',
				'icons/apple-icon-76x76.png',
				'icons/favicon-16x16.png',
				'icons/favicon-32x32.png',
				'icons/favicon-96x96.png',
				'icons/ms-icon-144x144.png',
				'fonts/fontawesome-webfont.ttf',
				'fonts/fontawesome-webfont.woff',
				'fonts/fontawesome-webfont.woff2'
			]);
		})
	);
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

this.addEventListener('activate', function(event) {
  var cacheWhitelist = ['bible_v1.3'];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});