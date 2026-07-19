import { createContext, useContext, useEffect, useRef, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const unsubscribeRef = useRef(() => {})

  useEffect(() => {
    let cancelled = false

    // Dynamically imported (not statically at the top of this file) so a
    // missing/broken Firebase config rejects this promise instead of
    // throwing during the app's initial module evaluation - the rest of
    // the site (all logged-out tools) must keep working regardless.
    import('../firebase/auth')
      .then(({ onAuthChange }) => {
        if (cancelled) return
        unsubscribeRef.current = onAuthChange((firebaseUser) => {
          setUser(firebaseUser)
          setAuthReady(true)
        })
      })
      .catch((error) => {
        console.error('[Auth] Failed to initialize:', error?.message)
        if (!cancelled) setAuthReady(true)
      })

    return () => {
      cancelled = true
      unsubscribeRef.current()
    }
  }, [])

  const signIn = async () => {
    const { signInWithGoogle } = await import('../firebase/auth')
    return signInWithGoogle()
  }

  const signOutUser = async () => {
    const { logOut } = await import('../firebase/auth')
    return logOut()
  }

  return (
    <AuthContext.Provider value={{ user, authReady, signIn, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
