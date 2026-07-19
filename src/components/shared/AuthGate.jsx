import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { IconGoogle } from './Icons'
import './AuthGate.css'

// Renders `children` once a user is signed in; otherwise shows a friendly
// sign-in prompt in the same spot. Shared by any page that's only useful
// while logged in (Tracker, Settings) so the prompt stays consistent.
export default function AuthGate({ eyebrow = 'Sign in', title, description, children }) {
  const { user, signIn } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (user) return children

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

  return (
    <div className="container auth-gate-page">
      <motion.div
        className="auth-gate organic-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="auth-gate__eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <button
          type="button"
          className="btn btn-primary auth-gate__btn"
          onClick={handleSignIn}
          disabled={busy}
        >
          <IconGoogle /> {busy ? 'Signing in...' : 'Sign in with Google'}
        </button>
        {error && <p className="auth-gate__error">{error}</p>}
      </motion.div>
    </div>
  )
}
