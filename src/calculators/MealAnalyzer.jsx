import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TextAreaInput } from '../components/shared/Inputs'
import Spinner from '../components/shared/Spinner'
import NumberCountUp from '../components/shared/NumberCountUp'
import { IconSparkle } from '../components/shared/Icons'
import { analyzeMeal } from '../firebase/ai'
import './MealAnalyzer.css'

export default function MealAnalyzer() {
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error | success
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (status === 'loading') return
    setStatus('loading')
    setError('')
    try {
      const data = await analyzeMeal(description)
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleAnalyze()
    }
  }

  return (
    <div className="meal-grid">
      <motion.div
        className="meal-inputs organic-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h4>AI Meal Analyzer</h4>
        <p className="meal-inputs__hint">
          Describe what you ate in plain language and Gemini will estimate calories and macros.
        </p>

        <TextAreaInput
          value={description}
          onChange={setDescription}
          onKeyDown={handleKeyDown}
          placeholder='e.g. "2 chapati, 1 bowl dal, 1 cup rice"'
          rows={4}
        />

        <button
          type="button"
          className="btn btn-primary meal-inputs__submit"
          onClick={handleAnalyze}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <Spinner size={16} /> Analyzing...
            </>
          ) : (
            <>
              <IconSparkle /> Analyze
            </>
          )}
        </button>

        <AnimatePresence>
          {status === 'error' && (
            <motion.p
              className="meal-inputs__error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="meal-result organic-1"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        {status === 'loading' && (
          <div className="meal-result__empty">
            <Spinner size={28} />
            <p>Analyzing your meal...</p>
          </div>
        )}

        {status !== 'loading' && status !== 'success' && (
          <div className="meal-result__empty">
            <IconSparkle className="meal-result__empty-icon" />
            <p>Describe a meal on the left and click Analyze to see estimated calories and macros.</p>
          </div>
        )}

        {status === 'success' && result && (
          <div className="meal-result__content">
            <div className="meal-items">
              {result.items.map((item, i) => (
                <motion.div
                  key={`${item.food}-${i}`}
                  className="meal-item"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="meal-item__name">
                    <span className="meal-item__food">{item.food}</span>
                    <span className="meal-item__qty">{item.quantity}</span>
                  </div>
                  <div className="meal-item__macros">
                    <span className="meal-item__cal">{item.calories} kcal</span>
                    <span>{item.protein_g}g P</span>
                    <span>{item.carbs_g}g C</span>
                    <span>{item.fat_g}g F</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="meal-totals">
              <div className="meal-totals__hero">
                <NumberCountUp value={result.total_calories} className="meal-totals__number" />
                <span className="meal-totals__label">total kcal</span>
              </div>
              <div className="meal-totals__macros">
                <div className="meal-totals__macro">
                  <NumberCountUp value={result.total_protein_g} format={(n) => Math.round(n) + 'g'} />
                  <span>Protein</span>
                </div>
                <div className="meal-totals__macro">
                  <NumberCountUp value={result.total_carbs_g} format={(n) => Math.round(n) + 'g'} />
                  <span>Carbs</span>
                </div>
                <div className="meal-totals__macro">
                  <NumberCountUp value={result.total_fat_g} format={(n) => Math.round(n) + 'g'} />
                  <span>Fat</span>
                </div>
              </div>
            </div>

            <div className="meal-tip">
              <IconSparkle />
              <p>{result.note}</p>
            </div>

            <p className="meal-disclaimer">AI estimates — actual values may vary.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
