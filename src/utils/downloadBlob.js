// Cross-environment-safe file download helper. Regular browser tabs and
// Chromium's installed/standalone PWA mode (desktop and Android) handle a
// normal anchor+download click just fine. iOS standalone PWA mode is the one
// environment that reliably can't: WebKit in standalone display mode has no
// download UI at all, so the only thing that actually works there is opening
// the blob in a new tab, where the user can use Share -> Save to Files
// instead.

/** True only for a website running as an installed iOS "Add to Home Screen" app. */
export function isIosStandalone() {
  return typeof navigator !== 'undefined' && navigator.standalone === true
}

/**
 * Downloads `blob` as `filename` where a real download is possible, or opens
 * it in a new tab where it isn't (iOS standalone, or if the download attempt
 * itself throws for any other reason). Returns `{ method: 'download' | 'tab' }`
 * so callers can show a follow-up hint for the 'tab' case.
 */
export function downloadOrOpenBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const revokeLater = () => setTimeout(() => URL.revokeObjectURL(url), 60000)

  if (isIosStandalone()) {
    window.open(url, '_blank')
    revokeLater()
    return { method: 'tab' }
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
    return { method: 'tab' }
  }
}
