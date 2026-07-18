import { motion } from 'framer-motion'
import { useStats } from '../context/StatsContext'
import DonutChart from '../components/shared/DonutChart'
import NumberCountUp from '../components/shared/NumberCountUp'
import { SegmentedToggle } from '../components/shared/Inputs'
import {
  calculateBMR,
  calculateTDEE,
  CALORIE_GOALS,
  calorieGoalTarget,
  calculateMacros,
  MACRO_PRESETS,
} from '../utils/calculations'
import './MacroCalculator.css'

const MACRO_COLORS = { protein: 'var(--chart-protein)', carbs: '#C5F547', fat: '#FF8A5C' }

export default function MacroCalculator() {
  const { stats, patch } = useStats()
  const bmr = calculateBMR(stats)
  const tdee = calculateTDEE({ bmr, activityLevel: stats.activityLevel })
  const goal = CALORIE_GOALS.find((g) => g.id === stats.selectedGoalId) ?? CALORIE_GOALS[3]
  const calories = calorieGoalTarget(tdee, goal.deltaLbPerWeek)
  const macros = calculateMacros(calories, stats.macroPreset)

  const segments = [
    { label: 'protein', value: macros.protein * 4, color: MACRO_COLORS.protein },
    { label: 'carbs', value: macros.carbs * 4, color: MACRO_COLORS.carbs },
    { label: 'fat', value: macros.fat * 9, color: MACRO_COLORS.fat },
  ]

  return (
    <div className="macro-grid">
      <motion.div
        className="macro-chart-card organic-2"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        <div className="macro-chart-card__preset">
          <SegmentedToggle
            options={Object.entries(MACRO_PRESETS).map(([key, p]) => ({
              value: key,
              label: p.label,
            }))}
            value={stats.macroPreset}
            onChange={(macroPreset) => patch({ macroPreset })}
          />
        </div>

        <div className="macro-chart-card__donut">
          <DonutChart segments={segments} size={210} strokeWidth={28} />
          <div className="macro-chart-card__center">
            <NumberCountUp value={calories} className="macro-chart-card__center-number" />
            <span>kcal / day</span>
          </div>
        </div>

        <p className="macro-chart-card__caption">
          Based on your <strong>{goal.label.toLowerCase()}</strong> calorie goal from the
          Calorie tab.
        </p>
      </motion.div>

      <div className="macro-list">
        <MacroRow name="Protein" grams={macros.protein} kcalPerGram={4} color={MACRO_COLORS.protein} delay={0} />
        <MacroRow name="Carbohydrates" grams={macros.carbs} kcalPerGram={4} color={MACRO_COLORS.carbs} delay={0.08} />
        <MacroRow name="Fat" grams={macros.fat} kcalPerGram={9} color={MACRO_COLORS.fat} delay={0.16} />
      </div>
    </div>
  )
}

function MacroRow({ name, grams, kcalPerGram, color, delay }) {
  return (
    <motion.div
      className="macro-row"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="macro-row__dot" style={{ background: color }} />
      <span className="macro-row__name">{name}</span>
      <span className="macro-row__grams">
        <NumberCountUp value={grams} />g
      </span>
      <span className="macro-row__kcal">{grams * kcalPerGram} kcal</span>
    </motion.div>
  )
}
