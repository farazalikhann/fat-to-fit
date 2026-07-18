import { motion } from 'framer-motion'
import { useStats } from '../context/StatsContext'
import NumberCountUp from '../components/shared/NumberCountUp'
import { idealWeightRange } from '../utils/calculations'
import { kgToLbs, round } from '../utils/units'
import './IdealWeightCalculator.css'

const FORMULAS = [
  { key: 'hamwi', name: 'Hamwi', year: '1964', desc: 'Quick clinical estimate still used by many dietitians.' },
  { key: 'devine', name: 'Devine', year: '1974', desc: 'Originally created for drug dosing; the most widely cited formula.' },
  { key: 'robinson', name: 'Robinson', year: '1983', desc: 'A refinement of Devine using updated population data.' },
]

export default function IdealWeightCalculator() {
  const { stats } = useStats()
  const results = idealWeightRange(stats.heightCm, stats.gender)
  const unit = stats.weightUnit
  const toDisplay = (kg) => (unit === 'kg' ? round(kg, 1) : round(kgToLbs(kg), 1))

  const values = Object.values(results)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const currentDisplay = toDisplay(stats.weightKg)

  return (
    <div className="ideal-grid">
      <motion.div
        className="ideal-range-card organic-3"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        <span className="ideal-range-card__eyebrow">Suggested healthy range</span>
        <div className="ideal-range-card__numbers">
          <NumberCountUp value={toDisplay(min)} className="ideal-range-card__number" />
          <span className="ideal-range-card__dash">–</span>
          <NumberCountUp value={toDisplay(max)} className="ideal-range-card__number" />
          <span className="ideal-range-card__unit">{unit}</span>
        </div>
        <p className="ideal-range-card__you">
          You're currently at <strong>{currentDisplay} {unit}</strong>
        </p>
      </motion.div>

      <div className="ideal-list">
        {FORMULAS.map((f, i) => (
          <motion.div
            key={f.key}
            className="ideal-row"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ideal-row__head">
              <span className="ideal-row__name">{f.name} <em>{f.year}</em></span>
              <span className="ideal-row__value">
                <NumberCountUp value={toDisplay(results[f.key])} />
                <span> {unit}</span>
              </span>
            </div>
            <p className="ideal-row__desc">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
