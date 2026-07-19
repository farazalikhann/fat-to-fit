import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore'
import { db } from './db'
import { dailyTotalDoc } from './dailyTotals'
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
 *
 * Also atomically increments that day's persisted total in `dailyTotals`
 * (in the same batch, so the entry and its running total never drift apart)
 * - that total is what powers the monthly calendar and survives long after
 * the entry itself auto-deletes at the 7-day mark.
 */
export async function addEntry(uid, data) {
  try {
    const now = new Date()
    const dateKey = getDateKey(now)
    const entryRef = doc(entriesCollection(uid))
    const batch = writeBatch(db)
    batch.set(entryRef, { ...data, createdAt: now.getTime(), dateKey })
    batch.set(dailyTotalDoc(uid, dateKey), { total: increment(data.calories || 0) }, { merge: true })
    await batch.commit()
    return entryRef.id
  } catch (error) {
    throw friendlyEntriesError('save that entry', error)
  }
}

/**
 * Deletes a single diary entry and atomically removes its calories from
 * that day's persisted total. Takes the full entry (not just its id) since
 * the calories/dateKey are needed to keep `dailyTotals` accurate.
 */
export async function deleteEntry(uid, entry) {
  try {
    const batch = writeBatch(db)
    batch.delete(doc(entriesCollection(uid), entry.id))
    batch.set(
      dailyTotalDoc(uid, entry.dateKey),
      { total: increment(-(entry.calories || 0)) },
      { merge: true },
    )
    await batch.commit()
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
 * Only the detailed entries are purged; their day's total in `dailyTotals`
 * is left untouched so monthly history keeps working.
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
