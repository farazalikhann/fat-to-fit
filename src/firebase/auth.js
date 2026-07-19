import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './config'

const googleProvider = new GoogleAuthProvider()

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/missing-password': 'Please enter a password.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/popup-closed-by-user': 'Sign-in was closed before completing.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/configuration-not-found':
    'This sign-in method is not enabled for this project yet (check Firebase Console > Authentication > Sign-in method).',
}

function friendlyAuthError(error) {
  const message = ERROR_MESSAGES[error?.code]
  return new Error(message || error?.message || 'Something went wrong. Please try again.')
}

/** Creates a new account with email + password. Returns the signed-in User. */
export async function signUpWithEmail(email, password) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    return credential.user
  } catch (error) {
    throw friendlyAuthError(error)
  }
}

/** Signs in an existing account with email + password. Returns the signed-in User. */
export async function signInWithEmail(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  } catch (error) {
    throw friendlyAuthError(error)
  }
}

/** Signs in with a Google account via popup. Returns the signed-in User. */
export async function signInWithGoogle() {
  try {
    const credential = await signInWithPopup(auth, googleProvider)
    return credential.user
  } catch (error) {
    throw friendlyAuthError(error)
  }
}

/** Signs the current user out. */
export async function logOut() {
  try {
    await signOut(auth)
  } catch (error) {
    throw friendlyAuthError(error)
  }
}

/**
 * Subscribes to auth state changes. `callback` receives the current User
 * (or null when signed out). Returns an unsubscribe function - call it in
 * a useEffect cleanup to avoid leaking the listener.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}
