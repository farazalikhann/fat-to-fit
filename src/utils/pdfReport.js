import {
  calculateBMR,
  calculateTDEE,
  CALORIE_GOALS,
  calorieGoalTarget,
  calculateMacros,
  MACRO_PRESETS,
  calculateBMI,
  bmiCategory,
  idealWeightRange,
  waterIntakeLiters,
  bodyFatNavy,
  bodyFatCategory,
  ACTIVITY_LEVELS,
} from './calculations'
import { cmToFtIn, kgToLbs, round } from './units'

const FOREST = [27, 67, 50]
const LIME = [197, 245, 71]
const SAGE = [82, 121, 111]
const TEXT = [20, 40, 29]
const LINE = [225, 230, 220]
const MUTED = [150, 150, 150]

export async function generatePdfReport(stats) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 48
  let y = 140

  // ---- Header band ----
  doc.setFillColor(...FOREST)
  doc.rect(0, 0, pageWidth, 110, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...LIME)
  doc.text('SPROUT', margin, 40)
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text('Your Health Report', margin, 68)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(215, 227, 217)
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.text(`Generated ${dateStr}`, margin, 88)

  const ensureSpace = (needed = 90) => {
    if (y + needed > pageHeight - 56) {
      doc.addPage()
      y = margin
    }
  }

  const addSectionTitle = (title) => {
    ensureSpace(46)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...FOREST)
    doc.text(title, margin, y)
    y += 7
    doc.setDrawColor(...LINE)
    doc.line(margin, y, pageWidth - margin, y)
    y += 20
  }

  const addRow = (label, value) => {
    ensureSpace(22)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...SAGE)
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...TEXT)
    doc.text(String(value), pageWidth - margin, y, { align: 'right' })
    y += 18
  }

  // ---- Your stats ----
  const { ft, inch } = cmToFtIn(stats.heightCm)
  addSectionTitle('Your Stats')
  addRow('Gender', stats.gender === 'female' ? 'Female' : 'Male')
  addRow('Age', `${stats.age} years`)
  addRow('Height', `${ft}'${inch}" (${round(stats.heightCm)} cm)`)
  addRow('Weight', `${round(kgToLbs(stats.weightKg), 1)} lb (${round(stats.weightKg, 1)} kg)`)
  addRow(
    'Activity level',
    ACTIVITY_LEVELS.find((a) => a.id === stats.activityLevel)?.label ?? '-',
  )
  y += 6

  // ---- Calories ----
  const bmr = calculateBMR(stats)
  const tdee = calculateTDEE({ bmr, activityLevel: stats.activityLevel })
  addSectionTitle('Calories (Mifflin-St Jeor)')
  addRow('BMR (Basal Metabolic Rate)', `${Math.round(bmr)} kcal/day`)
  addRow('TDEE (Maintenance)', `${Math.round(tdee)} kcal/day`)
  y += 4
  CALORIE_GOALS.forEach((g) => {
    if (g.deltaLbPerWeek === 0) return
    addRow(g.label, `${calorieGoalTarget(tdee, g.deltaLbPerWeek)} kcal/day`)
  })
  y += 6

  // ---- Macros ----
  const goal = CALORIE_GOALS.find((g) => g.id === stats.selectedGoalId) ?? CALORIE_GOALS[3]
  const goalCalories = calorieGoalTarget(tdee, goal.deltaLbPerWeek)
  const macros = calculateMacros(goalCalories, stats.macroPreset)
  const presetLabel = MACRO_PRESETS[stats.macroPreset]?.label ?? 'Balanced'
  addSectionTitle(`Macros (${presetLabel}, based on "${goal.label}")`)
  addRow('Protein', `${macros.protein} g  (${macros.protein * 4} kcal)`)
  addRow('Carbohydrates', `${macros.carbs} g  (${macros.carbs * 4} kcal)`)
  addRow('Fat', `${macros.fat} g  (${macros.fat * 9} kcal)`)
  y += 6

  // ---- BMI ----
  const bmi = calculateBMI(stats.weightKg, stats.heightCm)
  const bmiCat = bmiCategory(bmi)
  addSectionTitle('BMI (Body Mass Index)')
  addRow('Your BMI', bmi.toFixed(1))
  addRow('Category', bmiCat.label)
  y += 6

  // ---- Ideal weight ----
  const idealKg = idealWeightRange(stats.heightCm, stats.gender)
  const unit = stats.weightUnit
  const toDisp = (kg) => (unit === 'kg' ? `${round(kg, 1)} kg` : `${round(kgToLbs(kg), 1)} lb`)
  addSectionTitle('Ideal Weight')
  addRow('Hamwi formula (1964)', toDisp(idealKg.hamwi))
  addRow('Devine formula (1974)', toDisp(idealKg.devine))
  addRow('Robinson formula (1983)', toDisp(idealKg.robinson))
  y += 6

  // ---- Water intake ----
  const liters = waterIntakeLiters(stats.weightKg, stats.activityLevel)
  addSectionTitle('Daily Water Intake')
  addRow('Recommended', `${round(liters, 1)} L  (~${Math.round(liters * 33.814)} fl oz)`)
  y += 6

  // ---- Body fat (optional) ----
  const needsHip = stats.gender === 'female'
  const hasBodyFatInputs =
    stats.waistCm !== '' && stats.neckCm !== '' && (!needsHip || stats.hipCm !== '')
  if (hasBodyFatInputs) {
    const bf = bodyFatNavy({
      gender: stats.gender,
      waistCm: Number(stats.waistCm),
      neckCm: Number(stats.neckCm),
      hipCm: Number(stats.hipCm || 0),
      heightCm: stats.heightCm,
    })
    if (Number.isFinite(bf) && bf > 0) {
      const bfCat = bodyFatCategory(bf, stats.gender)
      addSectionTitle('Body Fat % (US Navy Method)')
      addRow('Estimated body fat', `${bf.toFixed(1)}%`)
      addRow('Category', bfCat.label)
      y += 6
    }
  }

  // ---- Footer disclaimer on every page ----
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      'For informational purposes only, not medical advice. Consult a qualified healthcare\nprovider before making changes to your diet or exercise routine.',
      margin,
      pageHeight - 40,
    )
    doc.text(`sproutcalc.com  -  Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 16, {
      align: 'right',
    })
  }

  doc.save('sprout-health-report.pdf')
}

// `chartDays`: [{ dateKey, label, fullDate, isToday, total, entries }] oldest
// -> newest, exactly what Tracker.jsx already computes for the weekly chart.
export async function generateTrackerReport({ userName, chartDays }) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 48
  let y = 140

  doc.setFillColor(...FOREST)
  doc.rect(0, 0, pageWidth, 110, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...LIME)
  doc.text('SPROUT', margin, 40)
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text('Your 7-Day Report', margin, 68)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(215, 227, 217)
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.text(`Generated ${dateStr}${userName ? ` for ${userName}` : ''}`, margin, 88)

  const ensureSpace = (needed = 90) => {
    if (y + needed > pageHeight - 56) {
      doc.addPage()
      y = margin
    }
  }

  const addSectionTitle = (title) => {
    ensureSpace(46)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...FOREST)
    doc.text(title, margin, y)
    y += 7
    doc.setDrawColor(...LINE)
    doc.line(margin, y, pageWidth - margin, y)
    y += 20
  }

  const addRow = (label, value, opts = {}) => {
    ensureSpace(22)
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
    doc.setFontSize(opts.small ? 10 : 11)
    doc.setTextColor(...(opts.dim ? MUTED : SAGE))
    doc.text(label, margin + (opts.indent || 0), y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...TEXT)
    doc.text(String(value), pageWidth - margin, y, { align: 'right' })
    y += opts.small ? 15 : 18
  }

  const totalWeek = chartDays.reduce((sum, d) => sum + (d.total || 0), 0)
  const daysLogged = chartDays.filter((d) => d.total > 0).length
  const avgPerLoggedDay = daysLogged > 0 ? Math.round(totalWeek / daysLogged) : 0

  addSectionTitle('Summary')
  addRow('Total calories (7 days)', `${Math.round(totalWeek)} kcal`)
  addRow('Days logged', `${daysLogged} / 7`)
  addRow('Average per logged day', `${avgPerLoggedDay} kcal`)
  y += 6

  addSectionTitle('Daily Totals')
  chartDays.forEach((day) => {
    addRow(day.fullDate || day.label, day.total > 0 ? `${day.total} kcal` : 'No entries logged')
  })
  y += 6

  chartDays.forEach((day) => {
    if (!day.entries || day.entries.length === 0) return
    addSectionTitle(`${day.fullDate || day.label} — ${day.total} kcal`)
    day.entries.forEach((entry) => {
      addRow(entry.food, `${entry.calories} kcal`, { small: true })
    })
    y += 4
  })

  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      'AI-estimated and self-reported values - not medical advice. Consult a qualified\nhealthcare provider before making changes to your diet or exercise routine.',
      margin,
      pageHeight - 40,
    )
    doc.text(`sproutcalc.com  -  Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 16, {
      align: 'right',
    })
  }

  doc.save('sprout-7-day-report.pdf')
}
