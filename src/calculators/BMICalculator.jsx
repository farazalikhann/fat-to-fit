import { motion } from 'framer-motion'
import { useStats } from '../context/StatsContext'
import Gauge from '../components/shared/Gauge'
import NumberCountUp from '../components/shared/NumberCountUp'
import { calculateBMI, bmiCategory } from '../utils/calculations'
import './BMICalculator.css'

const ZONES = [
  { from: 15, to: 18.5, to_label: 'Underweight', color: '#5B9BD5' },
  { from: 18.5, to: 25, to_label: 'Healthy', color: '#52796F' },
  { from: 25, to: 30, to_label: 'Overweight', color: '#E8A93B' },
  { from: 30, to: 40, to_label: 'Obese', color: '#FF8A5C' },
]

export default function BMICalculator() {
  const { stats } = useStats()
  const bmi = calculateBMI(stats.weightKg, stats.heightCm)
  const category = bmiCategory(bmi)

  return (
    <motion.div
      className="bmi-card organic-1"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
    >
      <div className="bmi-card__gauge">
        <Gauge value={bmi} domainMin={15} domainMax={40} zones={ZONES} size={300} />
        <div className="bmi-card__readout">
          <NumberCountUp value={bmi} format={(n) => n.toFixed(1)} className="bmi-card__number" />
          <span className="bmi-card__badge" style={{ background: category.color }}>
            {category.label}
          </span>
        </div>
      </div>

      <div className="bmi-card__legend">
        {ZONES.map((z) => (
          <div key={z.to_label} className="bmi-card__legend-item">
            <span className="bmi-card__legend-dot" style={{ background: z.color }} />
            <span>{z.to_label}</span>
            <span className="bmi-card__legend-range">
              {z.from}–{z.to === 40 ? '40+' : z.to}
            </span>
          </div>
        ))}
      </div>

      <p className="bmi-card__note">
        BMI is a screening tool, not a diagnosis — it doesn't account for muscle mass, bone
        density, or body composition. Use it alongside other measurements like body fat %.
      </p>
    </motion.div>
  )
}
