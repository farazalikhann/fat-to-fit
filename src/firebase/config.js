import { initializeApp, getApps, getApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId']
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key])
if (missingKeys.length) {
  const error = new Error(
    `Missing Firebase config value(s): ${missingKeys.join(', ')}. ` +
      'Check that your .env file defines VITE_FIREBASE_* variables (see .env.example), ' +
      'or that CI has the matching repository secrets set.',
  )
  // Distinguishable from Firebase's own AIError codes so callers (e.g.
  // ai.js) can show a specific "not configured" message instead of a
  // generic fallback.
  error.code = 'missing-config'
  throw error
}

// Guard against "Firebase App named '[DEFAULT]' already exists" during Vite HMR.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// NOTE: this file intentionally initializes ONLY the core app. Each product
// SDK (auth, firestore, storage, ai, analytics) is initialized inside its
// own module instead of here, so that importing e.g. ai.js doesn't drag the
// Auth/Firestore/Storage SDKs into the same bundle chunk - each feature
// only pays for the Firebase services it actually uses.
