// Service worker da versão instalável (ADR-0046). Só é registrado no build do GitHub Pages (VITE_PWA=1).
// Página: rede primeiro (pega versão nova), cache se offline. Arquivos com hash no nome: cache primeiro.
var CACHE = 'tavern-v1';
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  function save(res){
    if (res && res.ok){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
    return res;
  }
  if (req.mode === 'navigate'){
    e.respondWith(fetch(req).then(save).catch(function(){ return caches.match(req).then(function(r){ return r || caches.match('./'); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(hit){ return hit || fetch(req).then(save); }));
});
