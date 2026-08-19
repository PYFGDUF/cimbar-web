
var _cacheName = 'cimbar-recv-js-v2026-07-13T0523-ui-v2';
var _cacheFiles = [
  './recv.html',
  './cimbar_js.js',
  './cimbar_js.wasm',
  './recv.js',
  './recv-worker.js',
  './pwa-recv.json',
  './zstd.js'
];

// 预缓存（供离线 PWA 使用）
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(_cacheName).then(function (cache) {
      return cache.addAll(_cacheFiles);
    }).catch(function () {
      // 预缓存失败不阻塞安装，页面仍走网络
    })
  );
  self.skipWaiting();
});

// network-first：优先网络获取最新文件（避免缓存损坏导致 wasm 加载失败），
// 网络失败时回退缓存（离线兜底）
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (response) {
      if (response && response.ok && new URL(e.request.url).origin === location.origin) {
        var clone = response.clone();
        caches.open(_cacheName).then(function (cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});

// clean old caches
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.map(function (cn) {
          if (cn !== _cacheName) {
            return caches.delete(cn);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});
