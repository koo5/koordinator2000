// Import SvelteKit service worker helpers
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

// Add list of files to cache for offline use
const ASSETS = [
  ...(build || []), // the app itself (with fallback for build)
  ...(files || [])  // everything in `static` (with fallback for files)
];

// Install the service worker
self.addEventListener('install', (event) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    try {
      const cache = await caches.open(CACHE);
      // Add files in batches to prevent timeouts with large asset lists
      const chunks = [];
      const chunkSize = 50;
      
      for (let i = 0; i < ASSETS.length; i += chunkSize) {
        chunks.push(ASSETS.slice(i, i + chunkSize));
      }
      
      for (const chunk of chunks) {
        try {
          await cache.addAll(chunk);
        } catch (error) {
          console.error(`Failed to cache chunk: ${error}`);
        }
      }
    } catch (error) {
      console.error(`Failed to set up cache: ${error}`);
    }
  }

  event.waitUntil(addFilesToCache());
});

// Activate the service worker
self.addEventListener('activate', (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    try {
      for (const key of await caches.keys()) {
        if (key !== CACHE) await caches.delete(key);
      }
    } catch (error) {
      console.error(`Failed to delete old caches: ${error}`);
    }
  }

  event.waitUntil(deleteOldCaches());
  
  // Claim clients immediately
  self.clients.claim().catch(err => {
    console.error("Error claiming clients:", err);
  });
});

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests or non-GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip network requests to external resources like Firepad scripts
  if (event.request.url.includes('firepad.io') || 
      event.request.url.includes('codemirror') ||
      event.request.url.includes('firebase')) {
    return;
  }

  async function respond() {
    try {
      const url = new URL(event.request.url);
      const cache = await caches.open(CACHE);

      // `build` and `files` can always be served from the cache
      const pathWithoutQuery = url.pathname;
      if (ASSETS.includes(pathWithoutQuery)) {
        const cachedResponse = await cache.match(pathWithoutQuery);
        if (cachedResponse) return cachedResponse;
      }

      // For everything else, try the network first, but fall back to the cache
      try {
        const response = await fetch(event.request);

        // If we got a successful response, cache it
        if (response.status === 200) {
          try {
            await cache.put(event.request, response.clone());
          } catch (cacheError) {
            console.error(`Failed to cache response: ${cacheError}`);
          }
        }

        return response;
      } catch (fetchError) {
        // If we're offline, try to get it from the cache
        console.warn(`Network request failed, falling back to cache: ${fetchError}`);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;
        throw fetchError;
      }
    } catch (error) {
      console.error(`Service worker fetch handler error: ${error}`);
      return new Response('Service Worker Error', { status: 500 });
    }
  }

  event.respondWith(respond());
});
