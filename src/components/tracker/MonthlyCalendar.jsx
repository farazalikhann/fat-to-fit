import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconChevronLeft, IconChevronRight } from '../shared/Icons'
import { getDateKey, DAY_LABELS } from '../../utils/dateKeys'
import './MonthlyCalendar.css'

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function MonthlyCalendar({ uid, dailyGoal }) {
  const today = useMemo(() => new Date(), [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [totals, setTotals] = useState({})
  const [error, setError] = useState('')

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false

    const first = new Date(viewYear, viewMonth, 1)
    const last = new Date(viewYear, viewMonth + 1, 0)
    const startKey = getDateKey(first)
    const endKey = getDateKey(last)

    import('../../firebase/dailyTotals')
      .then(({ subscribeToMonthTotals }) => {
        if (cancelled) return
        unsubscribe = subscribeToMonthTotals(
          uid,
          startKey,
          endKey,
          (data) => setTotals(data),
          (err) => setError(err.message),
        )
      })
      .catch((err) => setError(err.message))

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [uid, viewYear, viewMonth])

  const handlePrev = () => {
    setError('')
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNext = () => {
    if (isCurrentMonth) return
    setError('')
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const leading = first.getDay()
    const todayKey = getDateKey(today)

    const out = []
    for (let i = 0; i < leading; i++) out.push(null)
    for (let day = 1; day <= daysInMonth; day++) {
      const key = getDateKey(new Date(viewYear, viewMonth, day))
      const total = Math.round(totals[key] || 0)
      out.push({
        day,
        dateKey: key,
        total,
        isToday: key === todayKey,
        isOver: dailyGoal > 0 && total > dailyGoal,
      })
    }
    return out
  }, [viewYear, viewMonth, totals, dailyGoal, today])

  return (
    <div className="monthly-cal">
      <div className="monthly-cal__head">
        <h3>
          {MONTH_LABELS[viewMonth]} {viewYear}
        </h3>
        <div className="monthly-cal__nav">
          <button type="button" onClick={handlePrev} aria-label="Previous month">
            <IconChevronLeft />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isCurrentMonth}
            aria-label="Next month"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>

      <div className="monthly-cal__weekdays">
        {DAY_LABELS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewYear}-${viewMonth}`}
          className="monthly-cal__grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {cells.map((cell, i) =>
            cell ? (
              <div
                key={cell.dateKey}
                className={`monthly-cal__cell ${cell.isToday ? 'is-today' : ''} ${cell.isOver ? 'is-over' : ''}`}
              >
                <span className="monthly-cal__day">{cell.day}</span>
                {cell.total > 0 && <span className="monthly-cal__total">{cell.total}</span>}
              </div>
            ) : (
              <div key={`blank-${i}`} className="monthly-cal__cell monthly-cal__cell--blank" />
            ),
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="monthly-cal__error">{error}</p>}

      {dailyGoal > 0 && (
        <p className="monthly-cal__legend">
          <span className="monthly-cal__legend-swatch is-over" /> over your {dailyGoal} kcal goal
        </p>
      )}
    </div>
  )
}
