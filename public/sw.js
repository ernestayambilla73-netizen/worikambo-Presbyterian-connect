const CACHE_NAME = "peace-public-shell-v10";
const APP_SHELL = ["/offline.html", "/manifest.json", "/pcg-connect-mark.svg"];
const PRIVATE_PREFIXES = ["/admin", "/api", "/auth", "/account", "/login"];
const STATIC_PREFIXES = ["/_next/static/", "/ministry-logos/"];
const STATIC_FILES = new Set(["/manifest.json", "/pcg-connect-mark.svg"]);

function isPrivatePath(path) {
  return PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
}
function isCacheablePublicPage(request, url) {
  if (request.mode !== "navigate" || isPrivatePath(url.pathname)) return false;
  if (request.headers.get("cookie") || request.headers.get("authorization")) return false;
  if (request.headers.get("RSC") || request.headers.get("Next-Router-Prefetch")) return false;
  return true;
}
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("peace-") && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isPrivatePath(url.pathname) || request.headers.get("authorization")) return;
  if (isCacheablePublicPage(request, url)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        const cacheControl = response.headers.get("Cache-Control") || "";
        if (response.ok && !response.headers.has("Set-Cookie") && !/private|no-store/i.test(cacheControl)) {
          await cache.put(new Request(url.origin + url.pathname), response.clone());
        }
        return response;
      } catch {
        return (await cache.match(new Request(url.origin + url.pathname))) || (await cache.match("/offline.html"));
      }
    })());
    return;
  }
  const isStaticAsset = STATIC_FILES.has(url.pathname) || STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
  if (!isStaticAsset || !["script", "style", "font", "image"].includes(request.destination)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") await cache.put(request, response.clone());
      return response;
    } catch { return cached || Response.error(); }
  })());
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const requested = new URL(event.notification.data?.url || "/", self.location.origin);
  const target = requested.origin === self.location.origin ? requested.href : self.location.origin + "/";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
    const existing = clients.find((client) => client.url.startsWith(self.location.origin));
    if (existing) {
      if ("navigate" in existing && new URL(existing.url).href !== target) await existing.navigate(target);
      return existing.focus();
    }
    return self.clients.openWindow(target);
  }));
});
