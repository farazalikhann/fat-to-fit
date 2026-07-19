// Talks to a small Cloudflare Worker proxy (see /worker) that holds the real
// OpenRouter API key server-side - this file never sees or sends a raw key,
// only the Worker's public URL. See worker/src/index.js for the system
// prompt, model selection, and upstream retry/fallback logic; this module
// owns the CLIENT-facing retry policy and user-facing error messages.

const PROXY_URL = import.meta.env.VITE_AI_PROXY_URL
const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 2
const RETRY_BASE_DELAY_MS = 700

const ERROR_MESSAGES = {
  'missing-config':
    "AI features aren't set up on this deployment yet (missing proxy URL). This isn't something wrong with your meal description - please let the site owner know.",
  'proxy-not-configured':
    "AI features aren't set up on this deployment yet (the server-side proxy is missing its API key). Please let the site owner know.",
  'auth-error':
    "AI features aren't set up correctly on this deployment yet (invalid API key). Please let the site owner know.",
  'rate-limited': 'The AI service is busy right now. Please try again in a moment.',
  'upstream-timeout': 'The AI service took too long to respond. Please try again.',
  'upstream-error': 'The AI service is temporarily unavailable. Please try again shortly.',
  'empty-upstream-response': "The AI didn't return a result. Please try again.",
  'method-not-allowed': 'Something is misconfigured on this deployment. Please let the site owner know.',
  'invalid-request-body': 'Something went wrong preparing that request. Please try again.',
  'empty-request': 'Please describe what you ate or attach a photo before analyzing.',
  timeout: 'The AI service took too long to respond. Please try again.',
  network: 'Network error - check your connection and try again.',
}

function friendlyAiError(error) {
  // Always log the real error for debugging - the UI only ever shows the
  // friendly message below, never this raw detail.
  console.error('[AI Meal Analyzer]', error?.code || '(no code)', '-', error?.message, error)

  const known = ERROR_MESSAGES[error?.code]
  if (known) return new Error(known)

  return new Error('Could not analyze this meal right now. Please try again.')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Only retry errors that are plausibly transient. A bad request shape,
// missing config, or auth problem will fail identically every time - retrying
// those just delays the (unavoidable) error reaching the user.
function isRetryableCode(code) {
  return code === 'rate-limited' || code === 'upstream-error' || code === 'upstream-timeout' || code === 'network'
}

async function callProxy(body) {
  if (!PROXY_URL) {
    throw Object.assign(new Error('VITE_AI_PROXY_URL is not set'), { code: 'missing-config' })
  }

  let lastError
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        let payload = null
        try {
          payload = await response.json()
        } catch {
          /* non-JSON error body from the proxy - fall through to a generic code */
        }
        throw Object.assign(new Error(`Proxy responded ${response.status}`), {
          code: payload?.error || 'upstream-error',
          status: response.status,
        })
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      const code = error.name === 'AbortError' ? 'timeout' : error.code || 'network'
      lastError = Object.assign(error, { code })
      if (attempt === MAX_RETRIES || !isRetryableCode(code)) throw lastError
      await sleep(RETRY_BASE_DELAY_MS * (attempt + 1))
    }
  }
  throw lastError
}

// The proxy's own JSON mode should prevent this, but strip markdown fences
// defensively in case a free model ever wraps its output in them anyway.
function stripCodeFence(text) {
  const trimmed = text.trim()
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return match ? match[1] : trimmed
}

function isValidMealPayload(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.items) || data.items.length === 0) {
    return false
  }
  return data.items.every(
    (item) =>
      item &&
      typeof item.food === 'string' &&
      typeof item.quantity === 'string' &&
      typeof item.calories === 'number' &&
      typeof item.protein_g === 'number' &&
      typeof item.carbs_g === 'number' &&
      typeof item.fat_g === 'number',
  )
}

/**
 * Shared core: sends `{ description?, image? }` to the AI proxy and returns
 * a validated `{ items, total_calories, total_protein_g, total_carbs_g,
 * total_fat_g, note }` object. Totals are recomputed from the item list
 * client-side so they always add up, regardless of the model's own math.
 */
async function runAnalysis(body) {
  let raw
  let modelUsed
  try {
    const data = await callProxy(body)
    raw = data?.text
    modelUsed = data?.modelUsed
  } catch (error) {
    throw friendlyAiError(error)
  }

  if (typeof raw !== 'string' || !raw.trim()) {
    throw friendlyAiError(
      Object.assign(new Error('empty response from proxy'), { code: 'empty-upstream-response' }),
    )
  }

  let parsed
  try {
    parsed = JSON.parse(stripCodeFence(raw))
  } catch {
    throw new Error("The AI response wasn't valid JSON. Please try again.")
  }

  if (!isValidMealPayload(parsed)) {
    throw new Error('The AI response was missing expected fields. Please try again.')
  }

  const totals = parsed.items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein_g: acc.protein_g + item.protein_g,
      carbs_g: acc.carbs_g + item.carbs_g,
      fat_g: acc.fat_g + item.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  )

  if (import.meta.env.DEV && modelUsed) {
    console.debug('[AI Meal Analyzer] answered by', modelUsed)
  }

  return {
    items: parsed.items,
    total_calories: Math.round(totals.calories),
    total_protein_g: Math.round(totals.protein_g),
    total_carbs_g: Math.round(totals.carbs_g),
    total_fat_g: Math.round(totals.fat_g),
    note:
      typeof parsed.note === 'string' && parsed.note
        ? parsed.note
        : 'Try to balance this meal with some vegetables or fiber.',
  }
}

/** Sends a plain-language meal description to the AI proxy. See `runAnalysis`. */
export async function analyzeMeal(description) {
  const trimmed = description?.trim()
  if (!trimmed) {
    throw new Error('Please describe what you ate before analyzing.')
  }
  return runAnalysis({ description: trimmed })
}

/**
 * Sends a photo of a meal to the AI proxy (multimodal), with an optional
 * caption. `imageBase64` must be a bare base64 string (no `data:` prefix) -
 * see `utils/imageCompress.js`. See `runAnalysis` for the return shape.
 */
export async function analyzeMealPhoto(imageBase64, mimeType, caption = '') {
  if (!imageBase64) {
    throw new Error('Please attach a photo before analyzing.')
  }
  return runAnalysis({ description: caption?.trim() || '', image: { mimeType, data: imageBase64 } })
}
