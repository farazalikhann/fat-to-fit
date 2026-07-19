import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore'
import { app } from './config'

// Persistent (IndexedDB-backed) local cache so My Tracker's entries/profile/
// dailyTotals keep showing their last-synced values when opened offline (as
// an installed PWA or otherwise) - onSnapshot listeners resolve from this
// cache immediately and update again once a real connection comes back.
// Multi-tab manager since the installed PWA and a regular browser tab can
// both be open against the same account at once.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

/** Adds a new document to `collectionPath` with an auto-generated ID. Returns the new doc's ID. */
export async function addDocument(collectionPath, data) {
  try {
    const ref = await addDoc(collection(db, collectionPath), data)
    return ref.id
  } catch (error) {
    throw new Error(`Failed to add document to "${collectionPath}": ${error.message}`)
  }
}

/** Reads a single document. Returns `{ id, ...data }`, or null if it doesn't exist. */
export async function getDocument(collectionPath, docId) {
  try {
    const snapshot = await getDoc(doc(db, collectionPath, docId))
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
  } catch (error) {
    throw new Error(`Failed to get document "${docId}" from "${collectionPath}": ${error.message}`)
  }
}

/** Updates fields on an existing document. Throws if the document doesn't exist. */
export async function updateDocument(collectionPath, docId, data) {
  try {
    await updateDoc(doc(db, collectionPath, docId), data)
  } catch (error) {
    throw new Error(`Failed to update document "${docId}" in "${collectionPath}": ${error.message}`)
  }
}

/** Deletes a document. */
export async function deleteDocument(collectionPath, docId) {
  try {
    await deleteDoc(doc(db, collectionPath, docId))
  } catch (error) {
    throw new Error(`Failed to delete document "${docId}" from "${collectionPath}": ${error.message}`)
  }
}

/**
 * Subscribes to real-time updates for a single document.
 * `onData` receives `{ id, ...data }` (or null if the doc doesn't exist)
 * every time it changes. Returns an unsubscribe function - call it in a
 * useEffect cleanup to avoid leaking the listener.
 */
export function subscribeToDocument(collectionPath, docId, onData, onError) {
  return onSnapshot(
    doc(db, collectionPath, docId),
    (snapshot) => onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    (error) => {
      const wrapped = new Error(
        `Realtime listener failed for "${docId}" in "${collectionPath}": ${error.message}`,
      )
      if (onError) onError(wrapped)
      else throw wrapped
    },
  )
}
