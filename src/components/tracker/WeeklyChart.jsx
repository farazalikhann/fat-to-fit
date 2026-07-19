import { motion } from 'framer-motion'
import './WeeklyChart.css'

// days: [{ dateKey, label, isToday, total }] ordered oldest -> newest (left to right)
export default function WeeklyChart({ days }) {
  const max = Math.max(1, ...days.map((d) => d.total))

  return (
    <div className="weekly-chart">
      {days.map((day, i) => {
        const heightPct = day.total > 0 ? Math.max(4, Math.round((day.total / max) * 100)) : 0
        return (
          <div className={`weekly-chart__col ${day.isToday ? 'is-today' : ''}`} key={day.dateKey}>
            <span className="weekly-chart__value">{day.total > 0 ? day.total : ''}</span>
            <div className="weekly-chart__track">
              <motion.div
                className="weekly-chart__bar"
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="weekly-chart__label">{day.label}</span>
          </div>
        )
      })}
    </div>
  )
}
