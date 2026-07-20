import { useEffect } from 'react'

const SITE_NAME = 'Sprout'
const SITE_URL = 'https://fatfit.club'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

function upsertMeta({ name, property, content }) {
  if (!content) return
  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    if (name) el.setAttribute('name', name)
    else el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Imperatively syncs document.title and the SEO-relevant meta/link tags in
 * <head> for the current route.
 *
 * This is a client-rendered SPA with no server-side rendering, so
 * index.html's static tags are only ever "correct" for the homepage -
 * every other route needs to overwrite them on mount, which is what this
 * does (no react-helmet dependency needed for something this small).
 * Googlebot executes JS before indexing a page, so this is picked up for
 * search; index.html's static tags remain the fallback for the (common)
 * case of a crawler/link-preview bot that never runs JS at all - e.g. most
 * chat apps' link-preview fetchers - which is why those defaults need to
 * be reasonable too, not just these per-route overrides.
 */
export function useSeo({ title, description, path = '/', image }) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`
    const ogImage = image || DEFAULT_OG_IMAGE

    document.title = title
    upsertMeta({ name: 'description', content: description })
    upsertLink('canonical', url)
    upsertMeta({ property: 'og:title', content: title })
    upsertMeta({ property: 'og:description', content: description })
    upsertMeta({ property: 'og:url', content: url })
    upsertMeta({ property: 'og:image', content: ogImage })
    upsertMeta({ name: 'twitter:title', content: title })
    upsertMeta({ name: 'twitter:description', content: description })
    upsertMeta({ name: 'twitter:image', content: ogImage })
  }, [title, description, path, image])
}

export { SITE_NAME, SITE_URL }
