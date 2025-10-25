const CACHE_NAME = "ai-nav-v1";
const RUNTIME_CACHE = "ai-nav-runtime";
const CDN_CACHE = "ai-nav-cdn";

// 需要缓存的核心资源
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./chat.html",
  "./service-worker.js",
];

// CDN 资源列表
const CDN_ASSETS = [
  "https://cdn.tailwindcss.com",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css",
  "https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js",
];

// Service Worker 安装事件 - 缓存核心资源
self.addEventListener("install", (event) => {
  console.log("Service Worker 安装中...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("核心资源缓存成功");
        return cache.addAll(CORE_ASSETS).catch(() => {
          // 如果有资源失败，继续处理其他的
          console.log("部分核心资源缓存失败，但继续执行");
        });
      })
      .then(() => {
        // 预缓存 CDN 资源
        return caches.open(CDN_CACHE).then((cache) => {
          cache.addAll(CDN_ASSETS).catch(() => {
            console.log("CDN 资源预缓存中...");
          });
        });
      })
  );
  self.skipWaiting();
});

// Service Worker 激活事件 - 清理旧缓存
self.addEventListener("activate", (event) => {
  console.log("Service Worker 激活中...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== RUNTIME_CACHE &&
            cacheName !== CDN_CACHE
          ) {
            console.log("删除旧缓存:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch 事件 - 实现智能缓存策略
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只缓存 GET 请求
  if (request.method !== "GET") {
    return;
  }

  // 忽略非 HTTP/HTTPS 请求
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // 处理 Simple Icons CDN
  if (
    url.hostname.includes("cdn.jsdelivr.net") &&
    url.pathname.includes("simple-icons")
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request)
          .then((response) => {
            // 如果是成功响应，缓存它
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CDN_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // 网络失败时返回缓存版本
            return caches.match(request);
          });
      })
    );
    return;
  }

  // 对于本站资源，使用 Cache-First 策略
  if (url.origin === location.origin) {
    event.respondWith(
      caches
        .match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // 离线时返回缓存版本或离线页面
          return caches.match(request);
        })
    );
    return;
  }

  // 对于 favicon API，使用 Network-First 策略
  if (
    url.hostname.includes("icon.horse") ||
    url.hostname.includes("google.com/s2/favicons") ||
    url.hostname.includes("favicons.githubusercontent.com")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CDN_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 其他 CDN 资源使用 Cache-First 策略
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CDN_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        });
    })
  );
});
