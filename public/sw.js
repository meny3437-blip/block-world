const CACHE='block-world-shell-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response.ok){
            const copy=response.clone();
            event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));
          }
          return response;
        })
        .catch(async()=>{
          const cache=await caches.open(CACHE);
          return (await cache.match(request))
            ||(await cache.match('./index.html'))
            ||(await cache.match('./'));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>{
      const refresh=fetch(request).then(response=>{
        if(response.ok&&response.type==='basic'){
          const copy=response.clone();
          event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));
        }
        return response;
      });
      return cached||refresh;
    })
  );
});
