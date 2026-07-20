// Thin wrapper around the raw gtag.js snippet loaded in index.html. Never
// throws and never blocks: if gtag hasn't loaded yet (slow network, an ad
// blocker, etc.) this is a silent no-op rather than a broken feature.
export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  try {
    window.gtag('event', name, params)
  } catch {
    /* analytics must never break the app */
  }
}
