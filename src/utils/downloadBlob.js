// Cross-environment-safe file download helper.
//
// The previous version of this file only special-cased iOS standalone mode,
// on the assumption that Chromium's installed/standalone PWA windows
// (desktop "Install" apps and Android "Add to Home Screen") would handle a
// normal anchor+download click the same as a regular tab. Real-device
// testing proved that assumption wrong: those windows can silently drop the
// download with no catchable JS error at all - `a.click()` simply doesn't
// throw, it just does nothing observable. That's why the earlier try/catch
// fallback never kicked in there: there was nothing to catch.
//
// So every standalone/installed context (iOS, Android, desktop) is now
// treated the same way: open the blob in a new tab instead of attempting a
// download. That new tab is a REGULAR browser tab/window, not a standalone
// app window, so the browser's own download/share UI is available there -
// this is what's actually confirmed to work, rather than relying on
// detecting a failure that never signals itself.

/** True for an installed/standalone PWA window, on any platform. */
export function isStandalonePwa() {
  if (typeof navigator !== 'undefined' && navigator.standalone === true) return true // iOS "Add to Home Screen"
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(display-mode: standalone)').matches) return true // Android / desktop installed app
    if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return true // desktop PWA w/ title-bar overlay
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return true
  }
  return false
}

const TAB_MESSAGE_IOS = 'PDF opened in a new tab — tap Share → Save to Files to save it.'
const TAB_MESSAGE_GENERIC = 'PDF opened in a new tab — use your browser’s download or share option there to save it.'

function tabMessage() {
  return typeof navigator !== 'undefined' && navigator.standalone === true
    ? TAB_MESSAGE_IOS
    : TAB_MESSAGE_GENERIC
}

/**
 * Downloads `blob` as `filename` where a real download is possible, or opens
 * it in a new (regular, non-standalone) tab where it isn't. Returns
 * `{ method: 'download' | 'tab', message? }` so callers can show a
 * follow-up hint for the 'tab' case.
 */
export function downloadOrOpenBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const revokeLater = () => setTimeout(() => URL.revokeObjectURL(url), 60000)

  if (isStandalonePwa()) {
    window.open(url, '_blank')
    revokeLater()
    return { method: 'tab', message: tabMessage() }
  }

  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    revokeLater()
    return { method: 'download' }
  } catch {
    window.open(url, '_blank')
    revokeLater()
    return { method: 'tab', message: tabMessage() }
  }
}
