import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TextAreaInput } from '../components/shared/Inputs'
import Spinner from '../components/shared/Spinner'
import NumberCountUp from '../components/shared/NumberCountUp'
import { IconSparkle, IconCamera, IconClose } from '../components/shared/Icons'
import { analyzeMeal, analyzeMealPhoto } from '../firebase/ai'
import { compressImage } from '../utils/imageCompress'
import { useAuth } from '../context/AuthContext'
import './MealAnalyzer.css'

export default function MealAnalyzer() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null) // { base64, mimeType, previewUrl }
  const [photoError, setPhotoError] = useState('')
  const [compressing, setCompressing] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | error | success
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [saveError, setSaveError] = useState('')

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    setCompressing(true)
    setPhotoError('')
    try {
      const compressed = await compressImage(file)
      setPhoto(compressed)
    } catch (err) {
      setPhotoError(err.message)
    } finally {
      setCompressing(false)
    }
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    setPhotoError('')
  }

  const handleAnalyze = async () => {
    if (status === 'loading') return
    if (!description.trim() && !photo) {
      setError('Describe your meal or attach a photo before analyzing.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setError('')
    setSaveState('idle')
    setSaveError('')
    try {
      const data = photo
        ? await analyzeMealPhoto(photo.base64, photo.mimeType, description)
        : await analyzeMeal(description)
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const handleSaveToDiary = async () => {
    if (!user || !result || saveState === 'saving') return
    setSaveState('saving')
    setSaveError('')
    try {
      const { addEntry } = await import('../firebase/entries')
      const foodLabel = description.trim() || result.items.map((i) => i.food).join(', ')
      await addEntry(user.uid, {
        food: foodLabel,
        calories: result.total_calories,
        protein_g: result.total_protein_g,
        carbs_g: result.total_carbs_g,
        fat_g: result.total_fat_g,
        source: 'ai',
      })
      setSaveState('saved')
    } catch (err) {
      setSaveState('error')
      setSaveError(err.message)
    }
  }

  const handleLogAnother = () => {
    setDescription('')
    setPhoto(null)
    setPhotoError('')
    setResult(null)
    setStatus('idle')
    setError('')
    setSaveState('idle')
    setSaveError('')
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
          Describe what you ate, attach a photo, or both - Gemini will estimate calories and macros.
        </p>

        <TextAreaInput
          value={description}
          onChange={setDescription}
          onKeyDown={handleKeyDown}
          placeholder='e.g. "2 chapati, 1 bowl dal, 1 cup rice"'
          rows={4}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelect}
          className="meal-photo-input"
        />

        <AnimatePresence mode="wait">
          {photo ? (
            <motion.div
              key="preview"
              className="meal-photo-preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <img src={photo.previewUrl} alt="Meal preview" />
              <button
                type="button"
                className="meal-photo-preview__remove"
                onClick={handleRemovePhoto}
                aria-label="Remove photo"
              >
                <IconClose />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="add"
              type="button"
              className="btn btn-ghost meal-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={compressing}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {compressing ? <Spinner size={14} /> : <IconCamera />}
              {compressing ? 'Processing photo...' : 'Add a photo'}
            </motion.button>
          )}
        </AnimatePresence>

        {photoError && <p className="meal-inputs__error">{photoError}</p>}

        <button
          type="button"
          className="btn btn-primary meal-inputs__submit"
          onClick={handleAnalyze}
          disabled={status === 'loading' || compressing}
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
            <p>{photo ? 'Analyzing your photo...' : 'Analyzing your meal...'}</p>
          </div>
        )}

        {status !== 'loading' && status !== 'success' && (
          <div className="meal-result__empty">
            <IconSparkle className="meal-result__empty-icon" />
            <p>
              Describe a meal or attach a photo on the left, then click Analyze to see estimated
              calories and macros.
            </p>
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

            {user && (
              <div className="meal-save">
                {saveState === 'saved' ? (
                  <button type="button" className="btn btn-ghost meal-save__btn is-saved" disabled>
                    ✓ Saved to today's diary
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost meal-save__btn"
                    onClick={handleSaveToDiary}
                    disabled={saveState === 'saving'}
                  >
                    {saveState === 'saving' ? 'Saving...' : "Save to today's diary"}
                  </button>
                )}
                <AnimatePresence>
                  {saveState === 'error' && (
                    <motion.p
                      className="meal-save__error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      role="alert"
                    >
                      {saveError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button type="button" className="btn btn-primary meal-log-another" onClick={handleLogAnother}>
              Log another meal
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
