import { collection, doc, onSnapshot, query, where, documentId } from 'firebase/firestore'
import { db } from './db'

function dailyTotalsCollection(uid) {
  return collection(db, 'users', uid, 'dailyTotals')
}

export function dailyTotalDoc(uid, dateKey) {
  return doc(dailyTotalsCollection(uid), dateKey)
}

function friendlyDailyTotalsError(action, error) {
  return new Error(`Could not ${action}: ${error.message}`)
}

/**
 * Subscribes to every day's persisted total within [startKey, endKey]
 * (inclusive, 'YYYY-MM-DD' strings). Unlike `entries`, these docs are never
 * auto-deleted, so a month view keeps working long after the underlying
 * entries for older days have been purged. `onData` receives a plain
 * `{ [dateKey]: total }` map (days with no doc simply don't appear).
 */
export function subscribeToMonthTotals(uid, startKey, endKey, onData, onError) {
  const q = query(
    dailyTotalsCollection(uid),
    where(documentId(), '>=', startKey),
    where(documentId(), '<=', endKey),
  )
  return onSnapshot(
    q,
    (snapshot) => {
      const totals = {}
      snapshot.docs.forEach((d) => {
        totals[d.id] = d.data().total || 0
      })
      onData(totals)
    },
    (error) => {
      const wrapped = friendlyDailyTotalsError('load your monthly totals', error)
      if (onError) onError(wrapped)
      else throw wrapped
    },
  )
}
