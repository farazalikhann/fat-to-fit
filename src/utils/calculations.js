// All formulas operate on metric base units (cm, kg) unless noted otherwise.

export const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    detail: 'Little or no exercise, desk job',
    multiplier: 1.2,
  },
  {
    id: 'light',
    label: 'Lightly active',
    detail: 'Light exercise 1–3 days/week',
    multiplier: 1.375,
  },
  {
    id: 'moderate',
    label: 'Moderately active',
    detail: 'Moderate exercise 3–5 days/week',
    multiplier: 1.55,
  },
  {
    id: 'active',
    label: 'Very active',
    detail: 'Hard exercise 6–7 days/week',
    multiplier: 1.725,
  },
  {
    id: 'veryActive',
    label: 'Extremely active',
    detail: 'Physical job or 2x/day training',
    multiplier: 1.9,
  },
]

export function getActivityMultiplier(id) {
  return ACTIVITY_LEVELS.find((a) => a.id === id)?.multiplier ?? 1.2
}

// ---------- BMR / TDEE (Mifflin-St Jeor) ----------
export function calculateBMR({ gender, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'female' ? base - 161 : base + 5
}

export function calculateTDEE({ bmr, activityLevel }) {
  return bmr * getActivityMultiplier(activityLevel)
}

// ---------- Goal calories ----------
// 1 lb of fat ≈ 3500 kcal
export const CALORIE_GOALS = [
  { id: 'lose2', label: 'Lose 2 lb/week', deltaLbPerWeek: -2, kind: 'lose' },
  { id: 'lose1', label: 'Lose 1 lb/week', deltaLbPerWeek: -1, kind: 'lose' },
  { id: 'lose0.5', label: 'Lose 0.5 lb/week', deltaLbPerWeek: -0.5, kind: 'lose' },
  { id: 'maintain', label: 'Maintain weight', deltaLbPerWeek: 0, kind: 'maintain' },
  { id: 'gain0.5', label: 'Gain 0.5 lb/week', deltaLbPerWeek: 0.5, kind: 'gain' },
  { id: 'gain1', label: 'Gain 1 lb/week', deltaLbPerWeek: 1, kind: 'gain' },
]

export function calorieGoalTarget(tdee, deltaLbPerWeek) {
  const dailyDelta = (deltaLbPerWeek * 3500) / 7
  return Math.max(1000, Math.round(tdee + dailyDelta))
}

// ---------- Macro presets ----------
export const MACRO_PRESETS = {
  balanced: { label: 'Balanced', protein: 0.3, carbs: 0.4, fat: 0.3 },
  highProtein: { label: 'High Protein', protein: 0.4, carbs: 0.3, fat: 0.3 },
  lowCarb: { label: 'Low Carb', protein: 0.35, carbs: 0.2, fat: 0.45 },
}

export function calculateMacros(calories, presetKey) {
  const preset = MACRO_PRESETS[presetKey] ?? MACRO_PRESETS.balanced
  return {
    protein: Math.round((calories * preset.protein) / 4),
    carbs: Math.round((calories * preset.carbs) / 4),
    fat: Math.round((calories * preset.fat) / 9),
  }
}

// ---------- BMI ----------
export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

export const BMI_CATEGORIES = [
  { id: 'under', label: 'Underweight', max: 18.5, color: '#5B9BD5' },
  { id: 'normal', label: 'Healthy weight', max: 25, color: '#52796F' },
  { id: 'over', label: 'Overweight', max: 30, color: '#E8A93B' },
  { id: 'obese', label: 'Obese', max: Infinity, color: '#FF8A5C' },
]

export function bmiCategory(bmi) {
  return BMI_CATEGORIES.find((c) => bmi < c.max) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
}

// ---------- Ideal weight (returns kg) ----------
export function idealWeightRange(heightCm, gender) {
  const totalInches = heightCm / 2.54
  const over60 = Math.max(0, totalInches - 60)
  const isFemale = gender === 'female'

  const devine = isFemale ? 45.5 + 2.3 * over60 : 50 + 2.3 * over60
  const robinson = isFemale ? 49 + 1.7 * over60 : 52 + 1.9 * over60
  const hamwi = isFemale ? 45.5 + 2.2 * over60 : 48 + 2.7 * over60

  return { devine, robinson, hamwi }
}

// ---------- Water intake ----------
export function waterIntakeLiters(weightKg, activityLevel) {
  const base = weightKg * 0.033
  const bump = {
    sedentary: 1,
    light: 1.07,
    moderate: 1.14,
    active: 1.22,
    veryActive: 1.3,
  }[activityLevel] ?? 1
  return base * bump
}

// ---------- Body fat % (US Navy method, cm inputs) ----------
export function bodyFatNavy({ gender, waistCm, neckCm, hipCm, heightCm }) {
  const log10 = Math.log10
  if (gender === 'female') {
    if (!hipCm) return null
    return (
      495 /
        (1.29579 -
          0.35004 * log10(waistCm + hipCm - neckCm) +
          0.221 * log10(heightCm)) -
      450
    )
  }
  return (
    495 / (1.0324 - 0.19077 * log10(waistCm - neckCm) + 0.15456 * log10(heightCm)) - 450
  )
}

export const BODY_FAT_CATEGORIES_MALE = [
  { label: 'Essential fat', max: 5 },
  { label: 'Athletic', max: 14 },
  { label: 'Fitness', max: 18 },
  { label: 'Average', max: 25 },
  { label: 'Obese', max: Infinity },
]

export const BODY_FAT_CATEGORIES_FEMALE = [
  { label: 'Essential fat', max: 13 },
  { label: 'Athletic', max: 21 },
  { label: 'Fitness', max: 25 },
  { label: 'Average', max: 32 },
  { label: 'Obese', max: Infinity },
]

export function bodyFatCategory(pct, gender) {
  const list = gender === 'female' ? BODY_FAT_CATEGORIES_FEMALE : BODY_FAT_CATEGORIES_MALE
  return list.find((c) => pct < c.max) ?? list[list.length - 1]
}
