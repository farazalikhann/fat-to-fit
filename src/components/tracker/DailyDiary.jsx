import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconTrash } from '../shared/Icons'
import NumberCountUp from '../shared/NumberCountUp'
import './DailyDiary.css'

export default function DailyDiary({ entries, total, onAddManual, onDelete }) {
  const [food, setFood] = useState('')
  const [calories, setCalories] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!food.trim() || calories === '' || busy) return
    setBusy(true)
    setError('')
    try {
      await onAddManual(food.trim(), Number(calories))
      setFood('')
      setCalories('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="daily-diary organic-2">
      <div className="daily-diary__head">
        <h3>Today</h3>
        <div className="daily-diary__total">
          <NumberCountUp value={total} />
          <span>kcal</span>
        </div>
      </div>

      <form className="daily-diary__form" onSubmit={handleAdd}>
        <input
          className="daily-diary__food-input"
          type="text"
          placeholder="Food name"
          value={food}
          onChange={(e) => setFood(e.target.value)}
          maxLength={80}
        />
        <input
          className="daily-diary__cal-input"
          type="number"
          placeholder="kcal"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          min="0"
          max="10000"
        />
        <button type="submit" className="btn btn-primary daily-diary__add" disabled={busy}>
          Add
        </button>
      </form>

      <AnimatePresence>
        {error && (
          <motion.p
            className="daily-diary__error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="daily-diary__list">
        {entries.length === 0 && <p className="daily-diary__empty">No meals logged yet today.</p>}
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              className="daily-diary__row"
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="daily-diary__row-info">
                <span className="daily-diary__row-food">{entry.food}</span>
                {entry.source === 'ai' && <span className="daily-diary__row-badge">AI</span>}
              </div>
              <div className="daily-diary__row-right">
                <span className="daily-diary__row-cal">{entry.calories} kcal</span>
                <button
                  type="button"
                  className="daily-diary__delete"
                  onClick={() => onDelete(entry.id)}
                  aria-label={`Delete ${entry.food}`}
                >
                  <IconTrash />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
