import { motion } from 'framer-motion'
import { useStats } from '../context/StatsContext'
import BottleFill from '../components/shared/BottleFill'
import NumberCountUp from '../components/shared/NumberCountUp'
import { waterIntakeLiters } from '../utils/calculations'
import { round } from '../utils/units'
import './WaterIntakeCalculator.css'

export default function WaterIntakeCalculator() {
  const { stats } = useStats()
  const liters = waterIntakeLiters(stats.weightKg, stats.activityLevel)
  const oz = liters * 33.814
  const cups = Math.round(liters / 0.25)

  return (
    <motion.div
      className="water-card organic-2"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
    >
      <div className="water-card__stats">
        <span className="water-card__eyebrow">Daily water target</span>
        <div className="water-card__number-row">
          <NumberCountUp value={round(liters, 1)} format={(n) => n.toFixed(1)} className="water-card__number" />
          <span className="water-card__unit">liters</span>
        </div>
        <p className="water-card__sub">
          ≈ <NumberCountUp value={Math.round(oz)} /> fl oz &middot; about {cups} glasses (250 ml each)
        </p>
        <p className="water-card__note">
          Estimated from your body weight and activity level. Hot weather, illness, or
          breastfeeding increase your needs further.
        </p>
      </div>

      <div className="water-card__visual">
        <BottleFill liters={liters} />
      </div>
    </motion.div>
  )
}
