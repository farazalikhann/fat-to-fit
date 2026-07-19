import { isSupported, getAnalytics } from 'firebase/analytics'
import { app } from './config'

// Analytics only works in a real browser (not SSR, not every test/embedded
// environment), so it's initialized lazily and may stay null. Not imported
// by anything yet - pull `analytics` from this module wherever you want to
// log events.
export let analytics = null

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) analytics = getAnalytics(app)
    })
    .catch(() => {
      /* analytics unsupported in this environment - safe to ignore */
    })
}
