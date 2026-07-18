import { motion } from 'framer-motion'
import { useStats } from '../context/StatsContext'
import ProgressRing from '../components/shared/ProgressRing'
import NumberCountUp from '../components/shared/NumberCountUp'
import { calculateBMR, calculateTDEE, CALORIE_GOALS, calorieGoalTarget } from '../utils/calculations'
import './CalorieCalculator.css'

export default function CalorieCalculator() {
  const { stats, patch } = useStats()
  const bmr = calculateBMR(stats)
  const tdee = calculateTDEE({ bmr, activityLevel: stats.activityLevel })

  return (
    <div className="calc-grid">
      <motion.div
        className="calc-hero-card organic-1"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        <ProgressRing progress={bmr / tdee} size={216} strokeWidth={16} color="#C5F547" trackColor="rgba(255,255,255,0.14)">
          <span className="calc-hero-card__label">Daily maintenance</span>
          <NumberCountUp value={Math.round(tdee)} className="calc-hero-card__number" />
          <span className="calc-hero-card__unit">kcal / day (TDEE)</span>
        </ProgressRing>
        <div className="calc-hero-card__bmr">
          <span>Base metabolic rate (BMR)</span>
          <strong>
            <NumberCountUp value={Math.round(bmr)} /> kcal
          </strong>
        </div>
      </motion.div>

      <div className="calc-goals">
        <h4 className="calc-goals__title">Pick a goal</h4>
        <div className="calc-goals__grid">
          {CALORIE_GOALS.map((goal, i) => {
            const target = calorieGoalTarget(tdee, goal.deltaLbPerWeek)
            const active = stats.selectedGoalId === goal.id
            return (
              <motion.button
                key={goal.id}
                type="button"
                className={`goal-card ${active ? 'is-active' : ''} ${goal.kind}`}
                onClick={() => patch({ selectedGoalId: goal.id })}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="goal-card__label">{goal.label}</span>
                <span className="goal-card__number">
                  <NumberCountUp value={target} />
                </span>
                <span className="goal-card__unit">kcal / day</span>
              </motion.button>
            )
          })}
        </div>
        <p className="calc-goals__note">
          Based on the Mifflin-St Jeor equation. 1 lb of body fat ≈ 3,500 kcal — goals adjust
          your daily target by a proportional deficit or surplus.
        </p>
      </div>
    </div>
  )
}
