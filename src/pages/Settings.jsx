import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import AuthGate from '../components/shared/AuthGate'
import SharedStatsPanel from '../sections/SharedStatsPanel'
import { Field, NumberInput } from '../components/shared/Inputs'
import { IconLogout } from '../components/shared/Icons'
import Spinner from '../components/shared/Spinner'
import './Settings.css'

// Mirrors firebase/profile.js's DEFAULT_PROFILE - duplicated here (rather
// than statically importing that module) so this file stays Firebase-free
// at the top level, consistent with every other lazy-loaded page.
const DEFAULT_PROFILE = {
  dailyGoal: 2000,
  heightCm: null,
  weightKg: null,
  gender: null,
  age: null,
  activityLevel: null,
}

export default function Settings() {
  const { authReady } = useAuth()

  useEffect(() => {
    document.title = 'Settings — Sprout'
  }, [])

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
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
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

  const handleGoalSave = async () => {
    setSaving(true)
    setSaveError('')
    setSaved(false)
    try {
      const { saveProfile } = await import('../firebase/profile')
      await saveProfile(user.uid, { dailyGoal: Number(goalInput) || 2000 })
      setGoalEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
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

  const goalChanged = Number(goalInput) !== profile.dailyGoal

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
        className="settings-goal organic-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <div className="settings-goal__head">
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
        {saveError && <p className="settings-goal__error">{saveError}</p>}
        <p className="settings-goal__hint">
          Used for the progress ring on My Tracker (currently {profile.dailyGoal} kcal/day).
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <SharedStatsPanel
          id="settings-stats"
          eyebrow="Your stats"
          title="Saved to your account"
        />
      </motion.div>

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
