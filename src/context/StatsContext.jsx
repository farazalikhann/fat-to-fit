import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { calculateBMR, calculateTDEE } from '../utils/calculations'

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
// (users/{uid}/profile/main) so it auto-fills on their next visit/login -
// including their preferred ft/in-vs-cm and lbs-vs-kg unit toggles, so a
// returning user sees the same units they left with. Calculator-only
// preferences (goal/macro preset, body-fat measurements) stay device-local.
const SYNCED_KEYS = ['gender', 'age', 'heightCm', 'weightKg', 'activityLevel', 'heightUnit', 'weightUnit']

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
      .then(async ({ getProfile, saveProfile }) => {
        const profile = await getProfile(user.uid)
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

        // Always push a merged snapshot back up on login - cloud values win
        // when present (the `patch` above), otherwise whatever the user
        // already had locally (e.g. entered as a guest before signing in).
        // This is what makes a first-time sign-in persist immediately: if
        // we only relied on the debounced save-on-change effect below, a
        // user who signs in without touching another input afterward would
        // never get their height/weight/gender/age/activity written to
        // Firestore at all, since nothing in `stats` actually changed.
        const merged = { ...stats, ...patch }
        const toSave = {}
        SYNCED_KEYS.forEach((key) => {
          toSave[key] = merged[key] === '' ? null : merged[key]
        })

        // Reflect a calculated daily goal immediately on login too (unless
        // the user already chose one manually in Settings/My Tracker), so
        // TDEE shows up on the tracker right away instead of waiting for
        // the user to touch a calculator input first.
        if (profile.goalSource !== 'manual') {
          const bmr = calculateBMR(merged)
          const tdee = calculateTDEE({ bmr, activityLevel: merged.activityLevel })
          if (Number.isFinite(tdee) && tdee > 0) {
            toSave.dailyGoal = Math.round(tdee)
            toSave.goalSource = 'auto'
          }
        }

        await saveProfile(user.uid, toSave)
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
        .then(async ({ saveProfile, getProfile }) => {
          // Re-check goalSource fresh (rather than trusting a stale value
          // from hydration) so a manual override made in another tab/page
          // during this session is never silently clobbered here.
          try {
            const current = await getProfile(uid)
            if (current.goalSource !== 'manual') {
              const bmr = calculateBMR(stats)
              const tdee = calculateTDEE({ bmr, activityLevel: stats.activityLevel })
              if (Number.isFinite(tdee) && tdee > 0) {
                data.dailyGoal = Math.round(tdee)
                data.goalSource = 'auto'
              }
            }
          } catch {
            /* if the goal-source check fails, still save the synced stats below */
          }
          await saveProfile(uid, data)
        })
        .catch((error) => console.error('[Stats] cloud profile save failed:', error.message))
    }, 800)
    return () => clearTimeout(timer)
  }, [
    user,
    stats.gender,
    stats.age,
    stats.heightCm,
    stats.weightKg,
    stats.activityLevel,
    stats.heightUnit,
    stats.weightUnit,
  ])

  const patch = (fields) => setStats((prev) => ({ ...prev, ...fields }))

  const value = useMemo(() => ({ stats, setStats, patch }), [stats])

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}

export function useStats() {
  const ctx = useContext(StatsContext)
  if (!ctx) throw new Error('useStats must be used within a StatsProvider')
  return ctx
}
