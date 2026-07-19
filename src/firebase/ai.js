const SYSTEM_INSTRUCTION = `You are a nutrition estimation assistant inside a calorie-tracking app.

The user describes a meal in plain, sometimes informal language (e.g. "2 chapati, 1 bowl dal, 1 cup rice"). For each message:

1. Identify every distinct food item and its quantity from the text.
2. If a quantity is vague or missing (e.g. "some rice", "a bowl of dal"), estimate a standard serving size and say so in the "quantity" field (e.g. "1 cup (est.)").
3. Estimate calories and macros (protein, carbs, fat in grams) per item using standard nutrition database values for common foods, including Indian/South Asian dishes.
4. Set total_calories, total_protein_g, total_carbs_g, and total_fat_g to the sum of the corresponding values across all items.
5. Write one short, single-sentence health tip relevant to this specific meal in "note".

Respond with ONLY raw JSON matching the required schema - no markdown code fences, no backticks, no explanations, no text outside the JSON object.`

const ERROR_MESSAGES = {
  'fetch-error': 'Network error - check your connection and try again.',
  'request-error': 'The AI service could not process that request. Please try rephrasing your meal.',
  'response-error': 'The AI service returned an unexpected response. Please try again.',
  'api-not-enabled': 'AI Logic is not enabled for this Firebase project yet.',
  'parse-failed': "The AI response wasn't valid. Please try again.",
  'no-api-key': 'Missing Firebase configuration.',
  'no-app-id': 'Missing Firebase configuration.',
  'no-project-id': 'Missing Firebase configuration.',
}

function friendlyAiError(error) {
  const message = ERROR_MESSAGES[error?.code]
  return new Error(message || 'Could not analyze this meal right now. Please try again.')
}

// The Firebase AI Logic SDK is fairly large (schema builders, streaming,
// websocket support for live sessions, etc.), so it's only fetched the
// first time someone actually clicks "Analyze" - not on initial page load.
let modelPromise = null
function getMealModel() {
  if (!modelPromise) {
    // `./config` is dynamically imported here too (not statically at the top
    // of this file): it throws if VITE_FIREBASE_* env vars are missing, and
    // that needs to surface as a catchable rejection scoped to this one
    // feature - not a top-level throw that takes down the whole app bundle
    // for every visitor regardless of whether they touch AI Meal at all.
    modelPromise = Promise.all([import('firebase/ai'), import('./config')]).then(
      ([{ getAI, getGenerativeModel, GoogleAIBackend, Schema }, { app }]) => {
      const mealItemSchema = Schema.object({
        properties: {
          food: Schema.string(),
          quantity: Schema.string(),
          calories: Schema.number(),
          protein_g: Schema.number(),
          carbs_g: Schema.number(),
          fat_g: Schema.number(),
        },
      })

      const mealResponseSchema = Schema.object({
        properties: {
          items: Schema.array({ items: mealItemSchema }),
          total_calories: Schema.number(),
          total_protein_g: Schema.number(),
          total_carbs_g: Schema.number(),
          total_fat_g: Schema.number(),
          note: Schema.string(),
        },
      })

      const ai = getAI(app, { backend: new GoogleAIBackend() })
      return getGenerativeModel(ai, {
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: mealResponseSchema,
        },
      })
    })
  }
  return modelPromise
}

// Gemini's own JSON mode should prevent this, but strip markdown fences
// defensively in case a response ever includes them anyway.
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
 * Sends a plain-language meal description to Gemini and returns a
 * validated `{ items, total_calories, total_protein_g, total_carbs_g,
 * total_fat_g, note }` object. Totals are recomputed from the item list
 * client-side so they always add up, regardless of the model's own math.
 */
export async function analyzeMeal(description) {
  const trimmed = description?.trim()
  if (!trimmed) {
    throw new Error('Please describe what you ate before analyzing.')
  }

  let raw
  try {
    const model = await getMealModel()
    const result = await model.generateContent(trimmed)
    raw = result.response.text()
  } catch (error) {
    throw friendlyAiError(error)
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
