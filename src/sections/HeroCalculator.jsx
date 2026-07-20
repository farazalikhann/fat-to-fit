import { useEffect, useState } from 'react'
import { useStats } from '../context/StatsContext'
import { useAuth } from '../context/AuthContext'
import { Field, NumberInput, SegmentedToggle } from '../components/shared/Inputs'
import NumberCountUp from '../components/shared/NumberCountUp'
import { ACTIVITY_LEVELS, calculateBMR, calculateTDEE } from '../utils/calculations'
import { cmToFtIn, ftInToCm, kgToLbs, lbsToKg, round } from '../utils/units'
import { getDateKey } from '../utils/dateKeys'
import { trackEvent } from '../utils/analytics'
import { IconGoogle } from '../components/shared/Icons'
import Spinner from '../components/shared/Spinner'
import './HeroCalculator.css'

export default function HeroCalculator() {
  const { stats, patch } = useStats()
  const { user, authReady, signIn } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [signInError, setSignInError] = useState('')
  const [todayTotal, setTodayTotal] = useState(null)

  const { ft, inch } = cmToFtIn(stats.heightCm)
  const weightDisplay =
    stats.weightUnit === 'kg' ? round(stats.weightKg, 1) : round(kgToLbs(stats.weightKg), 1)

  const bmr = calculateBMR(stats)
  const tdee = Math.round(calculateTDEE({ bmr, activityLevel: stats.activityLevel }))

  // Debounced so a user scrubbing through inputs fires one event once the
  // number settles, not one per keystroke.
  useEffect(() => {
    if (!Number.isFinite(tdee) || tdee <= 0) return
    const timer = setTimeout(() => {
      trackEvent('calculate_tdee', {
        value: tdee,
        gender: stats.gender,
        activity_level: stats.activityLevel,
      })
    }, 1200)
    return () => clearTimeout(timer)
  }, [tdee, stats.gender, stats.activityLevel])

  useEffect(() => {
    if (!user) {
      setTodayTotal(null)
      return
    }
    let unsubscribe = () => {}
    let cancelled = false
    const todayKey = getDateKey(new Date())
    import('../firebase/dailyTotals').then(({ subscribeToTodayTotal }) => {
      if (cancelled) return
      unsubscribe = subscribeToTodayTotal(user.uid, todayKey, setTodayTotal, () => setTodayTotal(null))
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [user])

  const handleSignIn = async () => {
    if (signingIn) return
    setSigningIn(true)
    setSignInError('')
    try {
      await signIn()
    } catch (err) {
      setSignInError(err.message)
    } finally {
      setSigningIn(false)
    }
  }

  const remaining = todayTotal !== null && Number.isFinite(tdee) ? Math.max(0, tdee - todayTotal) : null

  return (
    <div className="hero-calc organic-3">
      <div className="hero-calc__inputs">
        <div className="hero-calc__row">
          <Field label="Gender">
            <SegmentedToggle
              options={[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
              ]}
              value={stats.gender}
              onChange={(gender) => patch({ gender })}
            />
          </Field>
          <Field label="Age">
            <NumberInput
              value={stats.age}
              min={13}
              max={100}
              suffix="yrs"
              onChange={(age) => patch({ age })}
            />
          </Field>
        </div>

        <div className="hero-calc__row">
          <Field label="Height">
            <div className="hero-calc__pair">
              <NumberInput
                value={ft}
                min={3}
                max={8}
                suffix="ft"
                onChange={(v) => patch({ heightCm: ftInToCm(v, inch) })}
              />
              <NumberInput
                value={inch}
                min={0}
                max={11}
                suffix="in"
                onChange={(v) => patch({ heightCm: ftInToCm(ft, v) })}
              />
            </div>
          </Field>
          <Field label="Weight">
            <NumberInput
              value={weightDisplay}
              min={50}
              max={500}
              suffix="lbs"
              onChange={(v) => patch({ weightKg: v === '' ? '' : lbsToKg(v) })}
            />
          </Field>
        </div>

        <Field label="Activity level">
          <select
            className="hero-calc__select"
            value={stats.activityLevel}
            onChange={(e) => patch({ activityLevel: e.target.value })}
          >
            {ACTIVITY_LEVELS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="hero-calc__result">
        <span className="hero-calc__result-label">Estimated daily target</span>
        <NumberCountUp value={tdee} className="hero-calc__result-number" />
        <span className="hero-calc__result-unit">kcal / day</span>
        <span className="hero-calc__result-caption">Based on your age, height &amp; activity</span>

        {user && remaining !== null && (
          <p className="hero-calc__progress">
            You've hit {Math.round(todayTotal).toLocaleString()} kcal today —{' '}
            {remaining.toLocaleString()} remaining
          </p>
        )}

        {authReady && !user && (
          <>
            <button
              type="button"
              className="hero-calc__google-btn"
              onClick={handleSignIn}
              disabled={signingIn}
            >
              {signingIn ? <Spinner size={16} /> : <IconGoogle />}
              <span>{signingIn ? 'Signing in...' : 'Sign in with Google to save & track your progress'}</span>
            </button>
            {signInError && <p className="hero-calc__error">{signInError}</p>}
          </>
        )}

        {authReady && user && (
          <p className="hero-calc__saved">✓ Your data is saved — view in My Tracker</p>
        )}
      </div>
    </div>
  )
}
