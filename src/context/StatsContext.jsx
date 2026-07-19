import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'

export const StatsContext = createContext(null)

const STORAGE_KEY = 'sprout.stats.v1'

const DEFAULT_STATS = {
  gender: 'female',
  age: 30,
  heightCm: 165,
  weightKg: 65,
  activityLevel: 'moderate',
  heightUnit: 'ft', // 'ft' | 'cm'
  weightUnit: 'lbs', // 'lbs' | 'kg'
  waistCm: '',
  neckCm: '',
  hipCm: '',
  selectedGoalId: 'maintain',
  macroPreset: 'balanced',
}

// The subset of `stats` that's shared with a signed-in user's cloud profile
// (users/{uid}/profile/main) so it auto-fills on their next visit/login.
// Unit toggles and calculator-only preferences (goal/macro preset, body-fat
// measurements) stay device-local only.
const SYNCED_KEYS = ['gender', 'age', 'heightCm', 'weightKg', 'activityLevel']

function loadInitial() {
  if (typeof window === 'undefined') return DEFAULT_STATS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATS
    return { ...DEFAULT_STATS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STATS
  }
}

export function StatsProvider({ children }) {
  const { user, authReady } = useAuth()
  const [stats, setStats] = useState(loadInitial)
  const hydratedUidRef = useRef(null)
  const skipNextSaveRef = useRef(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
    } catch {
      /* ignore persistence failures (private browsing, etc.) */
    }
  }, [stats])

  // On sign-in, pull any previously-saved stats from this user's cloud
  // profile and fill them in - so they never have to re-enter their
  // gender/age/height/weight/activity level on a new visit or device.
  useEffect(() => {
    if (!authReady || !user) return
    if (hydratedUidRef.current === user.uid) return
    let cancelled = false

    import('../firebase/profile')
      .then(({ getProfile }) => getProfile(user.uid))
      .then((profile) => {
        if (cancelled) return
        hydratedUidRef.current = user.uid
        const patch = {}
        SYNCED_KEYS.forEach((key) => {
          if (profile[key] !== null && profile[key] !== undefined) patch[key] = profile[key]
        })
        if (Object.keys(patch).length > 0) {
          skipNextSaveRef.current = true
          setStats((prev) => ({ ...prev, ...patch }))
        }
      })
      .catch((error) => console.error('[Stats] cloud profile load failed:', error.message))

    return () => {
      cancelled = true
    }
  }, [user, authReady])

  // Whenever the synced fields change for a signed-in user, save them back
  // to their cloud profile (debounced, so we're not writing on every
  // keystroke). Skipped for the write that immediately follows hydration
  // above, since that would just save back the same values we just loaded.
  useEffect(() => {
    if (!user || hydratedUidRef.current !== user.uid) return
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return
    }
    const uid = user.uid
    const timer = setTimeout(() => {
      const data = {}
      SYNCED_KEYS.forEach((key) => {
        data[key] = stats[key] === '' ? null : stats[key]
      })
      import('../firebase/profile')
        .then(({ saveProfile }) => saveProfile(uid, data))
        .catch((error) => console.error('[Stats] cloud profile save failed:', error.message))
    }, 800)
    return () => clearTimeout(timer)
  }, [user, stats.gender, stats.age, stats.heightCm, stats.weightKg, stats.activityLevel])

  const patch = (fields) => setStats((prev) => ({ ...prev, ...fields }))

  const value = useMemo(() => ({ stats, setStats, patch }), [stats])

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}

export function useStats() {
  const ctx = useContext(StatsContext)
  if (!ctx) throw new Error('useStats must be used within a StatsProvider')
  return ctx
}
