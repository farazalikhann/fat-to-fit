import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { IconGoogle } from './Icons'
import Spinner from './Spinner'
import './AuthControl.css'

export default function AuthControl({ className = '' }) {
  const { user, authReady, signIn, signOut } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!authReady) return <span className={`auth-control auth-control--placeholder ${className}`} />

  const handleSignIn = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await signIn()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleSignOut = async () => {
    if (busy) return
    setBusy(true)
    try {
      await signOut()
    } catch {
      /* signing out should always feel instant; ignore failures here */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`auth-control-wrap ${className}`}>
      {user ? (
        <button
          type="button"
          className="auth-control auth-control--account"
          onClick={handleSignOut}
          disabled={busy}
          title="Sign out"
        >
          {user.photoURL ? (
            <img className="auth-control__avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="auth-control__avatar auth-control__avatar--initial">
              {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
            </span>
          )}
          <span className="auth-control__name">
            {busy ? 'Signing out...' : user.displayName?.split(' ')[0] || 'Account'}
          </span>
        </button>
      ) : (
        <button
          type="button"
          className="auth-control auth-control--signin"
          onClick={handleSignIn}
          disabled={busy}
        >
          {busy ? <Spinner size={14} /> : <IconGoogle />}
          <span>{busy ? 'Signing in...' : 'Sign in'}</span>
        </button>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            className="auth-control__error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
