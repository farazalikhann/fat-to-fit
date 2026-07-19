import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import DailyDiary from '../components/tracker/DailyDiary'
import WeeklyChart from '../components/tracker/WeeklyChart'
import ProfileCard from '../components/tracker/ProfileCard'
import TrackerPdfButton from '../components/tracker/TrackerPdfButton'
import MonthlyCalendar from '../components/tracker/MonthlyCalendar'
import MealAnalyzer from '../calculators/MealAnalyzer'
import AuthGate from '../components/shared/AuthGate'
import Spinner from '../components/shared/Spinner'
import { getDateKey, DAY_LABELS } from '../utils/dateKeys'
import './Tracker.css'

// Mirrors firebase/profile.js's DEFAULT_PROFILE - duplicated here (rather
// than statically importing that module) so this file stays Firebase-free
// at the top level, consistent with everything else in this lazy-loaded page.
const DEFAULT_PROFILE = { dailyGoal: 2000, heightCm: null, weightKg: null }

export default function Tracker() {
  const { user, authReady } = useAuth()

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

  return (
    <AuthGate
      eyebrow="My Tracker"
      title="Sign in to start tracking your meals"
      description="Log what you eat, see today's running total, and track the last 7 days - all synced to your account. Every calculator on this site still works without signing in; an account just unlocks your personal food diary."
    >
      <TrackerDashboard user={user} />
    </AuthGate>
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

  const entriesByDay = {}
  entries.forEach((e) => {
    ;(entriesByDay[e.dateKey] ??= []).push(e)
  })

  const chartDays = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = getDateKey(d)
    chartDays.push({
      dateKey: key,
      label: i === 0 ? 'Today' : DAY_LABELS[d.getDay()],
      fullDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      isToday: i === 0,
      total: Math.round(totalsByDay[key] || 0),
      entries: (entriesByDay[key] || []).slice().sort((a, b) => b.createdAt - a.createdAt),
    })
  }

  return { todayEntries, todayTotal, chartDays }
}

function TrackerDashboard({ user }) {
  const [entries, setEntries] = useState([])
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
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

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false

    import('../firebase/profile')
      .then(({ subscribeToProfile }) => {
        if (cancelled) return
        unsubscribe = subscribeToProfile(
          user.uid,
          (data) => setProfile(data),
          (err) => console.error('[Tracker] profile load failed:', err.message),
        )
      })
      .catch((err) => console.error('[Tracker] profile load failed:', err.message))

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

  const handleDelete = async (entry) => {
    const { deleteEntry } = await import('../firebase/entries')
    await deleteEntry(user.uid, entry)
  }

  const handleSaveProfile = async (data) => {
    const { saveProfile } = await import('../firebase/profile')
    await saveProfile(user.uid, data)
  }

  return (
    <div className="container tracker-page">
      <div className="tracker-header">
        <span className="tracker-header__eyebrow">My Tracker</span>
        <h1>Welcome back, {user.displayName?.split(' ')[0] || 'there'}</h1>
      </div>

      {error && <p className="tracker-page__error">{error}</p>}

      <ProfileCard user={user} profile={profile} todayTotal={todayTotal} onSave={handleSaveProfile} />

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
          <div className="tracker-chart-card__head">
            <h3>Last 7 days</h3>
            <TrackerPdfButton userName={user.displayName} chartDays={chartDays} />
          </div>
          <WeeklyChart days={chartDays} />
        </motion.div>
      </div>

      <motion.div
        className="tracker-calendar-section"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <MonthlyCalendar uid={user.uid} dailyGoal={profile.dailyGoal} />
      </motion.div>
    </div>
  )
}
