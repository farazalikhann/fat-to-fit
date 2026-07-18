import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const StatsContext = createContext(null)

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
  const [stats, setStats] = useState(loadInitial)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
    } catch {
      /* ignore persistence failures (private browsing, etc.) */
    }
  }, [stats])

  const patch = (fields) => setStats((prev) => ({ ...prev, ...fields }))

  const value = useMemo(() => ({ stats, setStats, patch }), [stats])

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}

export function useStats() {
  const ctx = useContext(StatsContext)
  if (!ctx) throw new Error('useStats must be used within a StatsProvider')
  return ctx
}
