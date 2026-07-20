import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ProgressRing from '../shared/ProgressRing'
import NumberCountUp from '../shared/NumberCountUp'
import { Field, NumberInput } from '../shared/Inputs'
import { cmToFtIn, ftInToCm, kgToLbs, lbsToKg, round } from '../../utils/units'
import './ProfileCard.css'

export default function ProfileCard({ user, profile, effectiveGoal, liveTdee, todayTotal, onSave, onResetGoal }) {
  const [editing, setEditing] = useState(false)
  const [goal, setGoal] = useState(effectiveGoal)
  const [ft, setFt] = useState(0)
  const [inch, setInch] = useState(0)
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setGoal(effectiveGoal)
    if (profile.heightCm) {
      const converted = cmToFtIn(profile.heightCm)
      setFt(converted.ft)
      setInch(converted.inch)
    }
    setWeight(profile.weightKg ? round(kgToLbs(profile.weightKg), 1) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, effectiveGoal])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const newGoal = Number(goal) || 2000
      // Only tag this as a manual override if the goal number actually
      // changed - submitting this combined form to update just height or
      // weight shouldn't silently lock the goal away from the home page's
      // calculator.
      const goalChanged = newGoal !== effectiveGoal
      await onSave({
        dailyGoal: newGoal,
        ...(goalChanged ? { goalSource: 'manual' } : {}),
        heightCm: ft || inch ? ftInToCm(ft, inch) : null,
        weightKg: weight !== '' ? lbsToKg(Number(weight)) : null,
      })
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    setSaving(true)
    setError('')
    try {
      await onResetGoal()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const progress = effectiveGoal > 0 ? todayTotal / effectiveGoal : 0
  const remaining = Math.round(effectiveGoal - todayTotal)
  const isOver = remaining < 0
  const isManual = profile.goalSource === 'manual'
  const heightDisplay = profile.heightCm
    ? (() => {
        const c = cmToFtIn(profile.heightCm)
        return `${c.ft}'${c.inch}"`
      })()
    : 'not set'
  const weightDisplay = profile.weightKg ? `${round(kgToLbs(profile.weightKg))} lb` : 'not set'

  return (
    <motion.div
      className="profile-card organic-3"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-card__top">
        <div className="profile-card__identity">
          {user.photoURL ? (
            <img
              className="profile-card__avatar"
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              width={52}
              height={52}
            />
          ) : (
            <span className="profile-card__avatar profile-card__avatar--initial">
              {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h2>{user.displayName || 'Your profile'}</h2>
            {!editing && (
              <p className="profile-card__meta">
                Goal {effectiveGoal} kcal · Height {heightDisplay} · Weight {weightDisplay}
              </p>
            )}
          </div>
        </div>

        {!editing && (
          <button type="button" className="btn btn-ghost profile-card__edit" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            className="profile-card__form-wrap"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <form className="profile-card__form" onSubmit={handleSave} noValidate>
              <div className="profile-card__form-grid">
                <Field label="Daily goal">
                  <NumberInput value={goal} onChange={setGoal} suffix="kcal" min={800} max={6000} />
                </Field>
                <Field label="Height">
                  <div className="profile-card__pair">
                    <NumberInput value={ft} onChange={setFt} suffix="ft" min={3} max={8} />
                    <NumberInput value={inch} onChange={setInch} suffix="in" min={0} max={11} />
                  </div>
                </Field>
                <Field label="Weight">
                  <NumberInput
                    value={weight}
                    onChange={setWeight}
                    suffix="lbs"
                    min={50}
                    max={600}
                    step={0.1}
                  />
                </Field>
              </div>

              {isManual && (
                <button type="button" className="profile-card__reset-link" onClick={handleReset} disabled={saving}>
                  Use calculated goal instead ({liveTdee.toLocaleString()} kcal, from your stats)
                </button>
              )}

              <div className="profile-card__form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
              {error && <p className="profile-card__error">{error}</p>}
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            className="profile-card__progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              type="button"
              className="profile-card__ring-btn"
              onClick={() => setEditing(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              aria-label="Edit your daily goal, height and weight"
            >
              <ProgressRing
                progress={progress}
                size={104}
                strokeWidth={9}
                color={isOver ? 'var(--coral)' : 'var(--lime-2)'}
              >
                <NumberCountUp value={Math.round(todayTotal)} className="profile-card__ring-number" />
                <span className="profile-card__ring-label">/ {effectiveGoal} kcal</span>
              </ProgressRing>
            </motion.button>
            <span className={`profile-card__ring-caption ${isOver ? 'is-over' : ''}`}>
              {isOver ? `${Math.abs(remaining).toLocaleString()} kcal over today` : `${remaining.toLocaleString()} kcal left today`}
            </span>
            {isManual ? (
              <button type="button" className="profile-card__goal-hint-btn" onClick={handleReset} disabled={saving}>
                Use calculated goal instead ({liveTdee.toLocaleString()} kcal)
              </button>
            ) : (
              <p className="profile-card__goal-hint">
                <Link to="/">Auto-calculated - tweak it on the home page</Link>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
