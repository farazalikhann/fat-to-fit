import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import DailyDiary from '../components/tracker/DailyDiary'
import WeeklyChart from '../components/tracker/WeeklyChart'
import MealAnalyzer from '../calculators/MealAnalyzer'
import { IconGoogle } from '../components/shared/Icons'
import Spinner from '../components/shared/Spinner'
import { getDateKey, DAY_LABELS } from '../utils/dateKeys'
import './Tracker.css'

export default function Tracker() {
  const { user, authReady, signIn } = useAuth()

  useEffect(() => {
    document.title = 'My Tracker — Sprout'
  }, [])

  if (!authReady) {
    return (
      <div className="container tracker-page">
        <div className="tracker-loading">
          <Spinner size={26} />
        </div>
      </div>
    )
  }

  if (!user) {
    return <SignInPrompt signIn={signIn} />
  }

  return <TrackerDashboard user={user} />
}

function SignInPrompt({ signIn }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await signIn()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container tracker-page">
      <motion.div
        className="tracker-signin organic-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="tracker-signin__eyebrow">My Tracker</span>
        <h1>Sign in to start tracking your meals</h1>
        <p>
          Log what you eat, see today's running total, and track the last 7 days - all synced to
          your account. Every calculator on this site still works without signing in; an account
          just unlocks your personal food diary.
        </p>
        <button
          type="button"
          className="btn btn-primary tracker-signin__btn"
          onClick={handleSignIn}
          disabled={busy}
        >
          <IconGoogle /> {busy ? 'Signing in...' : 'Sign in with Google'}
        </button>
        {error && <p className="tracker-signin__error">{error}</p>}
      </motion.div>
    </div>
  )
}

function buildTrackerData(entries) {
  const now = new Date()
  const todayKey = getDateKey(now)

  const todayEntries = [...entries]
    .filter((e) => e.dateKey === todayKey)
    .sort((a, b) => b.createdAt - a.createdAt)
  const todayTotal = todayEntries.reduce((sum, e) => sum + (e.calories || 0), 0)

  const totalsByDay = {}
  entries.forEach((e) => {
    totalsByDay[e.dateKey] = (totalsByDay[e.dateKey] || 0) + (e.calories || 0)
  })

  const chartDays = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = getDateKey(d)
    chartDays.push({
      dateKey: key,
      label: i === 0 ? 'Today' : DAY_LABELS[d.getDay()],
      isToday: i === 0,
      total: Math.round(totalsByDay[key] || 0),
    })
  }

  return { todayEntries, todayTotal, chartDays }
}

function TrackerDashboard({ user }) {
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false

    import('../firebase/entries')
      .then(({ purgeOldEntries, subscribeToRecentEntries }) => {
        if (cancelled) return
        purgeOldEntries(user.uid).catch((err) =>
          console.error('[Tracker] purge failed:', err.message),
        )
        unsubscribe = subscribeToRecentEntries(
          user.uid,
          (data) => setEntries(data),
          (err) => setError(err.message),
        )
      })
      .catch((err) => setError(err.message))

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [user.uid])

  const { todayEntries, todayTotal, chartDays } = useMemo(() => buildTrackerData(entries), [entries])

  const handleAddManual = async (food, calories) => {
    const { addEntry } = await import('../firebase/entries')
    await addEntry(user.uid, { food, calories, source: 'manual' })
  }

  const handleDelete = async (entryId) => {
    const { deleteEntry } = await import('../firebase/entries')
    await deleteEntry(user.uid, entryId)
  }

  return (
    <div className="container tracker-page">
      <div className="tracker-header">
        <span className="tracker-header__eyebrow">My Tracker</span>
        <h1>Welcome back, {user.displayName?.split(' ')[0] || 'there'}</h1>
      </div>

      {error && <p className="tracker-page__error">{error}</p>}

      <div className="tracker-grid">
        <div className="tracker-grid__main">
          <MealAnalyzer />
          <DailyDiary
            entries={todayEntries}
            total={todayTotal}
            onAddManual={handleAddManual}
            onDelete={handleDelete}
          />
        </div>

        <motion.div
          className="tracker-chart-card organic-1"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3>Last 7 days</h3>
          <WeeklyChart days={chartDays} />
        </motion.div>
      </div>
    </div>
  )
}
