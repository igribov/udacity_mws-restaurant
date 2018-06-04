const CACHE_VER = '<%= sw_version %>';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VER)
      .then(function (cache) {
        return cache.addAll([
          '/index.html',
          '/restaurant.html',
          '/js/main.js',
          '/js/restaurant_info.js',
          '/css/home.css',
          '/css/detail.css',
          '/css/common.css',
        ]);
      })
      .catch(function (error) {
        throw error;
      })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.host !== 'localhost:8888') {
    event.respondWith(fetch(event.request));
  } else if (requestUrl.host === 'localhost:1337') {
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      caches.match(event.request,{ignoreSearch: true}).then(function(resp) {
        if (event.request.method !== 'GET') {
          return;
        }
        if (resp) {
          console.log('GET_FROM_CACHE -> ', event.request.url);
          return resp;
        }
        return fetch(event.request).then(function(response) {
          return caches.open(CACHE_VER).then(function(cache) {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }

});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    console.log(event.ports);
    event.ports[0].postMessage('Skip Waiting event');
    self.skipWaiting();
  }
});

