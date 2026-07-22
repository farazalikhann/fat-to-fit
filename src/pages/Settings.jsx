import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useStats } from '../context/StatsContext'
import { useSeo } from '../utils/seo'
import AuthGate from '../components/shared/AuthGate'
import Modal from '../components/shared/Modal'
import SharedStatsPanel from '../sections/SharedStatsPanel'
import { Field, NumberInput } from '../components/shared/Inputs'
import { IconLogout } from '../components/shared/Icons'
import Spinner from '../components/shared/Spinner'
import { ACTIVITY_LEVELS, calculateBMR, calculateTDEE } from '../utils/calculations'
import { cmToFtIn, kgToLbs, round } from '../utils/units'
import './Settings.css'

// Mirrors firebase/profile.js's DEFAULT_PROFILE - duplicated here (rather
// than statically importing that module) so this file stays Firebase-free
// at the top level, consistent with every other lazy-loaded page.
const DEFAULT_PROFILE = {
  dailyGoal: 2000,
  goalSource: null,
  heightCm: null,
  weightKg: null,
  gender: null,
  age: null,
  activityLevel: null,
}

export default function Settings() {
  const { authReady } = useAuth()

  useSeo({
    title: 'Account Settings — Sprout',
    description:
      'Manage your Sprout profile: display name, saved height, weight, age, activity level, and daily calorie goal.',
    path: '/settings',
  })

  if (!authReady) {
    return (
      <div className="container settings-page">
        <div className="settings-loading">
          <Spinner size={26} />
        </div>
      </div>
    )
  }

  return (
    <AuthGate
      eyebrow="Settings"
      title="Sign in to manage your settings"
      description="Your display name, saved stats, and daily goal all live here once you're signed in."
    >
      <SettingsDashboard />
    </AuthGate>
  )
}

function SettingsDashboard() {
  const { user, signOut } = useAuth()
  const { stats } = useStats()
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [editOpen, setEditOpen] = useState(false)
  const [goalInput, setGoalInput] = useState(DEFAULT_PROFILE.dailyGoal)
  const [goalEditing, setGoalEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busyLogout, setBusyLogout] = useState(false)

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false

    import('../firebase/profile')
      .then(({ subscribeToProfile }) => {
        if (cancelled) return
        unsubscribe = subscribeToProfile(
          user.uid,
          (data) => {
            setProfile(data)
            setGoalInput((prev) => (goalEditing ? prev : data.dailyGoal))
          },
          (err) => console.error('[Settings] profile load failed:', err.message),
        )
      })
      .catch((err) => console.error('[Settings] profile load failed:', err.message))

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [user.uid])

  const liveTdee = Math.round(
    calculateTDEE({ bmr: calculateBMR(stats), activityLevel: stats.activityLevel }),
  )
  const isManual = profile.goalSource === 'manual'
  const effectiveGoal = isManual ? profile.dailyGoal : liveTdee

  const handleGoalSave = async () => {
    setSaving(true)
    setSaveError('')
    setSaved(false)
    try {
      const { saveProfile } = await import('../firebase/profile')
      await saveProfile(user.uid, { dailyGoal: Number(goalInput) || 2000, goalSource: 'manual' })
      setGoalEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleResetGoal = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const { saveProfile } = await import('../firebase/profile')
      await saveProfile(user.uid, { dailyGoal: liveTdee, goalSource: 'auto' })
      setGoalEditing(false)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    if (busyLogout) return
    setBusyLogout(true)
    try {
      await signOut()
    } catch {
      /* signing out should always feel instant; ignore failures here */
    } finally {
      setBusyLogout(false)
    }
  }

  const goalChanged = Number(goalInput) !== effectiveGoal

  const { ft, inch } = cmToFtIn(stats.heightCm)
  const heightDisplay = stats.heightUnit === 'cm' ? `${round(stats.heightCm)} cm` : `${ft}'${inch}"`
  const weightDisplay =
    stats.weightUnit === 'kg' ? `${round(stats.weightKg, 1)} kg` : `${round(kgToLbs(stats.weightKg), 1)} lbs`
  const activityLabel = ACTIVITY_LEVELS.find((a) => a.id === stats.activityLevel)?.label ?? ''

  return (
    <div className="container settings-page">
      <div className="settings-header">
        <span className="settings-header__eyebrow">Settings</span>
        <h1>Your account</h1>
      </div>

      <motion.div
        className="settings-identity organic-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {user.photoURL ? (
          <img
            className="settings-identity__avatar"
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            width={56}
            height={56}
          />
        ) : (
          <span className="settings-identity__avatar settings-identity__avatar--initial">
            {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
          </span>
        )}
        <div className="settings-identity__text">
          <span className="settings-identity__name">{user.displayName || 'Your account'}</span>
          <span className="settings-identity__email">{user.email}</span>
        </div>
      </motion.div>

      <motion.div
        className="settings-summary organic-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <div className="settings-summary__head">
          <span className="stats-panel__eyebrow">Your profile</span>
          <h2>Saved stats &amp; goal</h2>
        </div>
        <p className="settings-summary__line">
          Gender: {stats.gender === 'female' ? 'Female' : 'Male'} · Age: {stats.age} · Height:{' '}
          {heightDisplay} · Weight: {weightDisplay} · Activity: {activityLabel}
        </p>
        <p className="settings-summary__goal">
          Goal: {effectiveGoal.toLocaleString()} kcal/day
          {isManual && <span className="settings-summary__manual-tag"> (manually set)</span>}
        </p>
        <button
          type="button"
          className="btn btn-primary settings-summary__edit-btn"
          onClick={() => setEditOpen(true)}
        >
          Edit my stats
        </button>
      </motion.div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit your stats">
        <SharedStatsPanel id="settings-modal-stats" showHeading={false} bare />

        <div className="settings-modal-goal">
          <div className="settings-modal-goal__head">
            <span className="stats-panel__eyebrow">Daily target</span>
            <h3>Daily calorie goal</h3>
          </div>
          <div className="settings-goal__row">
            <Field label="Goal">
              <NumberInput
                value={goalInput}
                onChange={(v) => {
                  setGoalEditing(true)
                  setGoalInput(v)
                }}
                suffix="kcal"
                min={800}
                max={6000}
              />
            </Field>
            <button
              type="button"
              className="btn btn-primary settings-goal__save"
              onClick={handleGoalSave}
              disabled={saving || !goalChanged}
            >
              {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
          {isManual && (
            <button
              type="button"
              className="settings-goal__reset"
              onClick={handleResetGoal}
              disabled={saving}
            >
              Use calculated goal instead ({liveTdee.toLocaleString()} kcal)
            </button>
          )}
          {saveError && <p className="settings-goal__error">{saveError}</p>}
          <p className="settings-goal__hint">
            Used for the progress ring on My Tracker. Saving a goal here overrides the number
            automatically calculated from your stats.
          </p>
        </div>

        <button type="button" className="btn btn-ghost settings-modal-done" onClick={() => setEditOpen(false)}>
          Done
        </button>
      </Modal>

      <motion.div
        className="settings-logout"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <button
          type="button"
          className="btn btn-ghost settings-logout__btn"
          onClick={handleLogout}
          disabled={busyLogout}
        >
          <IconLogout /> {busyLogout ? 'Signing out...' : 'Log out'}
        </button>
      </motion.div>
    </div>
  )
}
