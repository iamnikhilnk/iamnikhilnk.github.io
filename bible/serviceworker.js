this.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open('bible_v1.0').then(function(cache) {
			return cache.addAll([
				'/',
				'bible.html',
				'css/bible.css',
				'js/jquery-1.8.3.js',
				'js/responsivevoice.js',
				'js/bible.js',
				'media/network.error.mp3',
				'media/instructions.mp3'
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
  var cacheWhitelist = ['bible_v1.0'];

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