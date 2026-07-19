import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from './db'
import { getDateKey, startOfDaysAgo } from '../utils/dateKeys'

// "Last 7 days" = today plus the preceding 6 days.
const SEVEN_DAY_CUTOFF = () => startOfDaysAgo(6)

function entriesCollection(uid) {
  return collection(db, 'users', uid, 'entries')
}

function friendlyEntriesError(action, error) {
  return new Error(`Could not ${action}: ${error.message}`)
}

/**
 * Adds a diary entry for `uid`. `data` should include at minimum
 * `{ food, calories }`; optional macro fields and `source` ('ai' | 'manual')
 * are stored as-is. Stamps createdAt/dateKey automatically.
 */
export async function addEntry(uid, data) {
  try {
    const now = new Date()
    const ref = await addDoc(entriesCollection(uid), {
      ...data,
      createdAt: now.getTime(),
      dateKey: getDateKey(now),
    })
    return ref.id
  } catch (error) {
    throw friendlyEntriesError('save that entry', error)
  }
}

/** Deletes a single diary entry. */
export async function deleteEntry(uid, entryId) {
  try {
    await deleteDoc(doc(db, 'users', uid, 'entries', entryId))
  } catch (error) {
    throw friendlyEntriesError('delete that entry', error)
  }
}

/**
 * Subscribes to real-time updates for the last 7 days of entries, newest
 * first. `onData` receives an array of `{ id, ...data }`. Returns an
 * unsubscribe function.
 */
export function subscribeToRecentEntries(uid, onData, onError) {
  const q = query(
    entriesCollection(uid),
    where('createdAt', '>=', SEVEN_DAY_CUTOFF()),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (error) => {
      const wrapped = friendlyEntriesError('load your diary', error)
      if (onError) onError(wrapped)
      else throw wrapped
    },
  )
}

/**
 * Deletes any entries older than 7 days for `uid`. Client-side only (no
 * Cloud Functions, so this runs opportunistically whenever the tracker
 * page loads for a signed-in user) - safe to call as often as needed.
 */
export async function purgeOldEntries(uid) {
  try {
    const q = query(entriesCollection(uid), where('createdAt', '<', SEVEN_DAY_CUTOFF()))
    const snapshot = await getDocs(q)
    await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)))
    return snapshot.size
  } catch (error) {
    throw friendlyEntriesError('clean up old entries', error)
  }
}
