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
8. Output the JSON object only. Nothing else.`

// Tried in order. The router is tried first (it auto-selects a suitable
// free model, including vision-capable ones when an image is present), then
// a couple of concrete free models as a hedge against the router or any
// single free model being temporarily unavailable/deprecated - the exact
// same class of problem this project has already hit once with Gemini's
// free tier ("gemini-2.5-flash" was retired without notice).
const MODEL_CHAIN = [
  'openrouter/free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'google/gemma-4-31b-it:free',
]

const MAX_RETRIES_PER_MODEL = 1
const RETRY_DELAY_MS = 500
const UPSTREAM_TIMEOUT_MS = 25000

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

  return response.json()
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Only retry on errors that are plausibly transient (rate limit, upstream
// hiccup, timeout) - never retry a 400 (bad request shape) or 401/403 (auth),
// since those will fail identically every time and just waste the retry
// budget before falling through to the next model.
function isRetryable(error) {
  if (error?.name === 'AbortError') return true
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
        const result = await callOpenRouter(model, userContent, apiKey, controller.signal)
        clearTimeout(timeout)
        return { result, modelUsed: model }
      } catch (error) {
        clearTimeout(timeout)
        lastError = error
        // A bad/missing API key fails identically for every model - no
        // point burning the rest of the fallback chain on it.
        if (error?.status === 401 || error?.status === 403) throw error
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
      const { result, modelUsed } = await analyzeWithFallback(userContent, env.OPENROUTER_API_KEY)
      const text = result?.choices?.[0]?.message?.content
      if (typeof text !== 'string' || !text.trim()) {
        return jsonResponse({ error: 'empty-upstream-response' }, 502, origin)
      }
      return jsonResponse({ text, modelUsed }, 200, origin)
    } catch (error) {
      const status = typeof error?.status === 'number' ? error.status : 502
      const code =
        status === 429
          ? 'rate-limited'
          : error?.name === 'AbortError'
            ? 'upstream-timeout'
            : status >= 500
              ? 'upstream-error'
              : status === 401 || status === 403
                ? 'auth-error'
                : 'upstream-error'
      return jsonResponse({ error: code, status }, status >= 400 && status < 600 ? status : 502, origin)
    }
  },
}
