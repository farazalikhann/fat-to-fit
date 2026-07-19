import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ProgressRing from '../shared/ProgressRing'
import NumberCountUp from '../shared/NumberCountUp'
import { Field, NumberInput } from '../shared/Inputs'
import { cmToFtIn, ftInToCm, kgToLbs, lbsToKg, round } from '../../utils/units'
import './ProfileCard.css'

export default function ProfileCard({ user, profile, todayTotal, onSave }) {
  const [editing, setEditing] = useState(false)
  const [goal, setGoal] = useState(profile.dailyGoal)
  const [ft, setFt] = useState(0)
  const [inch, setInch] = useState(0)
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setGoal(profile.dailyGoal)
    if (profile.heightCm) {
      const converted = cmToFtIn(profile.heightCm)
      setFt(converted.ft)
      setInch(converted.inch)
    }
    setWeight(profile.weightKg ? round(kgToLbs(profile.weightKg), 1) : '')
  }, [profile])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({
        dailyGoal: Number(goal) || 2000,
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

  const progress = profile.dailyGoal > 0 ? todayTotal / profile.dailyGoal : 0
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
            />
          ) : (
            <span className="profile-card__avatar profile-card__avatar--initial">
              {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h3>{user.displayName || 'Your profile'}</h3>
            {!editing && (
              <p className="profile-card__meta">
                Goal {profile.dailyGoal} kcal · Height {heightDisplay} · Weight {weightDisplay}
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
            <ProgressRing progress={progress} size={104} strokeWidth={9} color="var(--lime-2)">
              <NumberCountUp value={Math.round(todayTotal)} className="profile-card__ring-number" />
              <span className="profile-card__ring-label">/ {profile.dailyGoal} kcal</span>
            </ProgressRing>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
