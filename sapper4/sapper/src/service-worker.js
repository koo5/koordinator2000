// Import SvelteKit service worker helpers
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

// Add list of files to cache for offline use
const ASSETS = [
  ...build, // the app itself
  ...files  // everything in `static`
];

// Install the service worker
self.addEventListener('install', (event) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

// Activate the service worker
self.addEventListener('activate', (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
});

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // `build` and `files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      return cache.match(url.pathname);
    }

    // For everything else, try the network first, but fall back to the cache
    try {
      const response = await fetch(event.request);

      // If we got a successful response, cache it
      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch {
      // If we're offline, try to get it from the cache
      return cache.match(event.request);
    }
  }

  event.respondWith(respond());
});
