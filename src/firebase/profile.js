import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from './db'

export const DEFAULT_PROFILE = { dailyGoal: 2000, heightCm: null, weightKg: null }

function profileDoc(uid) {
  return doc(db, 'users', uid, 'profile', 'main')
}

function friendlyProfileError(action, error) {
  return new Error(`Could not ${action}: ${error.message}`)
}

/** One-time read of a user's profile, with sensible defaults if it doesn't exist yet. */
export async function getProfile(uid) {
  try {
    const snap = await getDoc(profileDoc(uid))
    return snap.exists() ? { ...DEFAULT_PROFILE, ...snap.data() } : { ...DEFAULT_PROFILE }
  } catch (error) {
    throw friendlyProfileError('load your profile', error)
  }
}

/** Upserts profile fields (merge: true, so it works whether or not the doc exists yet). */
export async function saveProfile(uid, data) {
  try {
    await setDoc(profileDoc(uid), data, { merge: true })
  } catch (error) {
    throw friendlyProfileError('save your profile', error)
  }
}

/** Real-time profile subscription. `onData` always receives defaults-filled data. */
export function subscribeToProfile(uid, onData, onError) {
  return onSnapshot(
    profileDoc(uid),
    (snap) => onData(snap.exists() ? { ...DEFAULT_PROFILE, ...snap.data() } : { ...DEFAULT_PROFILE }),
    (error) => {
      const wrapped = friendlyProfileError('load your profile', error)
      if (onError) onError(wrapped)
      else throw wrapped
    },
  )
}
