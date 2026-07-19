// Sprout AI proxy — a small Cloudflare Worker whose only job is to hold
// OPENROUTER_API_KEY server-side and forward meal-analysis requests to
// OpenRouter. The React app (a static site with no server of its own) never
// sees this key: it only ever talks to this Worker's public URL.
//
// Deploy with: npx wrangler deploy   (see worker/README.md)

const SYSTEM_INSTRUCTION = `You are a precise nutrition-estimation engine embedded in a calorie-tracking app. You are not a chatbot: never explain, apologize, greet, or add commentary of any kind.

INPUT: the user provides a plain-language meal description (e.g. "2 chapati, 1 bowl dal, 1 cup rice"), a photo of a meal, or both.

OUTPUT: respond with exactly one raw JSON object matching this schema - no other keys, no missing keys, no markdown code fences, no backticks, no text before or after the JSON:
{
  "items": [
    { "food": string, "quantity": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number }
  ],
  "total_calories": number,
  "total_protein_g": number,
  "total_carbs_g": number,
  "total_fat_g": number,
  "note": string
}

RULES:
1. Identify every distinct food item and its quantity from the text and/or the photo (use plate size, utensil size, and typical portioning as visual cues when quantity isn't stated).
2. If a quantity is vague or must be estimated, use a standard serving size and mark it in "quantity" (e.g. "1 cup (est.)").
3. Estimate calories and macros per item using standard nutrition database values, including common Indian/South Asian dishes.
4. total_calories/total_protein_g/total_carbs_g/total_fat_g must equal the sum of the corresponding per-item values.
5. "note" is exactly one short, single-sentence, meal-specific health tip.
6. If a photo is provided but no food is clearly visible, return exactly one item: food "Unclear photo", quantity "n/a", all four numeric fields 0, and a "note" asking the user to retake the photo or describe the meal in text instead - never fail silently, never return an empty items array.
7. "items" must never be empty.
8. Never respond with anything other than the JSON object - no safety notices, no meta-commentary, no partial answers. If you cannot analyze the input for any reason, use the "Unclear photo" fallback in rule 6 instead of any other response shape.
9. Output the JSON object only. Nothing else.`

// Tried in order. The router is tried first (it auto-selects a suitable
// free model, including vision-capable ones when an image is present), then
// a couple of concrete free models as a hedge against the router - or any
// single free model - being temporarily unavailable, deprecated, or (as
// found in production) occasionally ignoring the JSON-only instruction and
// returning something else entirely (e.g. a bare safety-classifier string).
// Response *content* is validated below, not just the HTTP status, so a
// model that returns garbage with a 200 OK still triggers the same
// move-to-the-next-model fallback as a real HTTP error would.
const MODEL_CHAIN = [
  'openrouter/free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'google/gemma-4-31b-it:free',
]

const MAX_RETRIES_PER_MODEL = 1
const RETRY_DELAY_MS = 500
const UPSTREAM_TIMEOUT_MS = 18000

// Only these origins may call this Worker - prevents other sites from
// riding on your OpenRouter free-tier quota. Add your own dev/prod origins
// here if you fork or redeploy this.
const ALLOWED_ORIGINS = [
  'https://farazalikhann.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

function buildUserContent(description, image) {
  if (!image) return description
  const parts = []
  if (description?.trim()) parts.push({ type: 'text', text: description.trim() })
  else parts.push({ type: 'text', text: 'Analyze this meal photo.' })
  parts.push({ type: 'image_url', image_url: { url: `data:${image.mimeType};base64,${image.data}` } })
  return parts
}

// The proxy's response_format:json_object should prevent this, but strip
// markdown fences defensively in case a free model ever wraps its output in
// them anyway.
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

// Calls OpenRouter and returns the validated raw JSON text on success. Throws
// on any problem - HTTP-level (rate limit, auth, server error) or content-
// level (empty response, unparseable text, wrong shape) - so the caller can
// treat "model responded but with garbage" exactly like a real HTTP failure
// and move on to the next model in the chain.
async function callOpenRouter(model, userContent, apiKey, signal) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // Recommended by OpenRouter for attribution/analytics - not secret.
      'HTTP-Referer': 'https://farazalikhann.github.io/fat-to-fit/',
      'X-Title': 'Sprout Meal Analyzer',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    const error = new Error(`OpenRouter ${response.status}: ${errorText.slice(0, 300)}`)
    error.status = response.status
    throw error
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content

  if (typeof text !== 'string' || !text.trim()) {
    throw Object.assign(new Error(`${model} returned empty content`), { code: 'bad-content' })
  }

  let parsed
  try {
    parsed = JSON.parse(stripCodeFence(text))
  } catch {
    throw Object.assign(new Error(`${model} did not return valid JSON: ${text.slice(0, 200)}`), {
      code: 'bad-content',
    })
  }

  if (!isValidMealPayload(parsed)) {
    throw Object.assign(new Error(`${model} returned JSON missing expected fields`), {
      code: 'bad-content',
    })
  }

  return text
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Only retry on errors that are plausibly transient (rate limit, upstream
// hiccup, timeout) or fixable by trying a different model ("bad-content" -
// a model that ignored the JSON-only instruction). Never retry a 400 (bad
// request shape) or 401/403 (auth), since those fail identically every time
// and just waste the retry budget before falling through.
function isRetryable(error) {
  if (error?.name === 'AbortError') return true
  if (error?.code === 'bad-content') return true
  if (typeof error?.status === 'number') return error.status === 429 || error.status >= 500
  return true // network-level failure (no status at all)
}

async function analyzeWithFallback(userContent, apiKey) {
  let lastError = null

  for (const model of MODEL_CHAIN) {
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)
      try {
        const text = await callOpenRouter(model, userContent, apiKey, controller.signal)
        clearTimeout(timeout)
        return { text, modelUsed: model }
      } catch (error) {
        clearTimeout(timeout)
        lastError = error
        // A bad/missing API key fails identically for every model - no
        // point burning the rest of the fallback chain on it.
        if (error?.status === 401 || error?.status === 403) throw error
        // A model that ignored the JSON-only instruction is likely to do so
        // again at the same temperature - move straight to the next (different)
        // model instead of spending a retry + delay on the same one. This
        // keeps the worst case fast enough to fit inside the client's own
        // timeout budget.
        if (error?.code === 'bad-content') break
        if (!isRetryable(error) || attempt === MAX_RETRIES_PER_MODEL) break
        await sleep(RETRY_DELAY_MS * (attempt + 1))
      }
    }
  }

  throw lastError || new Error('All models failed with no error detail.')
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'method-not-allowed' }, 405, origin)
    }

    if (!env.OPENROUTER_API_KEY) {
      // Server-side misconfiguration (missing secret) - never the visitor's
      // fault, and never leaks anything about the key itself.
      return jsonResponse({ error: 'proxy-not-configured' }, 500, origin)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'invalid-request-body' }, 400, origin)
    }

    const description = typeof body?.description === 'string' ? body.description : ''
    const image =
      body?.image?.mimeType && body?.image?.data
        ? { mimeType: body.image.mimeType, data: body.image.data }
        : null

    if (!description.trim() && !image) {
      return jsonResponse({ error: 'empty-request' }, 400, origin)
    }

    try {
      const userContent = buildUserContent(description, image)
      const { text, modelUsed } = await analyzeWithFallback(userContent, env.OPENROUTER_API_KEY)
      return jsonResponse({ text, modelUsed }, 200, origin)
    } catch (error) {
      const status = typeof error?.status === 'number' ? error.status : null
      const code =
        error?.code === 'bad-content'
          ? 'invalid-model-response'
          : status === 429
            ? 'rate-limited'
            : error?.name === 'AbortError'
              ? 'upstream-timeout'
              : status >= 500
                ? 'upstream-error'
                : status === 401 || status === 403
                  ? 'auth-error'
                  : 'upstream-error'
      const httpStatus = status && status >= 400 && status < 600 ? status : 502
      return jsonResponse({ error: code, status: httpStatus }, httpStatus, origin)
    }
  },
}
