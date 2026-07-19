const CACHE_NAME = 'sprout-v3'

// Never cache (or serve from cache) requests to the AI proxy or any
// Firebase/Google Cloud API - these are live, stateful, or real-time
// endpoints where a stale cached response would be actively wrong (an old
// AI answer, or frozen Firestore/Auth data), not just outdated. POST
// requests are already skipped below regardless, but this also covers any
// GET traffic these SDKs make (e.g. Firestore's realtime channel) so it's
// never accidentally cached, and can't be served from a network failure
// like ordinary static assets are.
const NETWORK_ONLY_HOSTS = [
  'sprout-ai-proxy.sprout-faraz.workers.dev',
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'www.googleapis.com',
]

function isNetworkOnly(url) {
  try {
    return NETWORK_ONLY_HOSTS.includes(new URL(url).hostname)
  } catch {
    return false
  }
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  // The AI proxy and Firebase/Google APIs always go straight to the network,
  // never cached and never served from cache on failure - regardless of
  // method. (POST requests, which is what the AI proxy and most Firestore
  // writes use, never reach the caching logic below anyway since that's
  // GET-only, but this also explicitly covers any GET traffic these SDKs
  // make, like Firestore's realtime channel.)
  if (isNetworkOnly(event.request.url)) {
    event.respondWith(fetch(event.request))
    return
  }

  if (event.request.method !== 'GET') return

  // Never fall back to a cached copy of the HTML shell. A stale index.html
  // can reference content-hashed asset filenames from a previous deploy
  // that no longer exist on the server once a new deploy replaces them -
  // that mismatch (not a code bug) is what causes a blank page for a
  // returning visitor. Navigations always go straight to the network.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
        return response
      })
      .catch(() => caches.match(event.request)),
  )
})
