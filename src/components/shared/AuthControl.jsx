import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { IconGoogle, IconSettings, IconLogout } from './Icons'
import Spinner from './Spinner'
import './AuthControl.css'

// variant "menu" - a compact avatar button that opens a dropdown (desktop nav).
// variant "inline" - name/email + actions rendered directly, no toggle (mobile nav panel).
export default function AuthControl({ className = '', variant = 'menu', onNavigate }) {
  const { user, authReady, signIn, signOut } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

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
    setOpen(false)
    setBusy(true)
    try {
      await signOut()
    } catch {
      /* signing out should always feel instant; ignore failures here */
    } finally {
      setBusy(false)
    }
  }

  if (!user) {
    return (
      <div className={`auth-control-wrap ${className}`}>
        <button
          type="button"
          className="auth-control auth-control--signin"
          onClick={handleSignIn}
          disabled={busy}
        >
          {busy ? <Spinner size={14} /> : <IconGoogle />}
          <span>{busy ? 'Signing in...' : 'Sign in'}</span>
        </button>
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

  const avatar = user.photoURL ? (
    <img
      className="auth-control__avatar"
      src={user.photoURL}
      alt=""
      referrerPolicy="no-referrer"
      width={24}
      height={24}
    />
  ) : (
    <span className="auth-control__avatar auth-control__avatar--initial">
      {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
    </span>
  )

  if (variant === 'inline') {
    return (
      <div className={`auth-inline ${className}`}>
        <div className="auth-inline__identity">
          {avatar}
          <div className="auth-inline__text">
            <span className="auth-inline__name">{user.displayName || 'Your account'}</span>
            <span className="auth-inline__email">{user.email}</span>
          </div>
        </div>
        <Link to="/settings" className="auth-inline__item" onClick={onNavigate}>
          <IconSettings /> Settings
        </Link>
        <button
          type="button"
          className="auth-inline__item auth-inline__item--danger"
          onClick={handleSignOut}
          disabled={busy}
        >
          <IconLogout /> {busy ? 'Signing out...' : 'Log out'}
        </button>
        {error && <p className="auth-control__error auth-control__error--inline">{error}</p>}
      </div>
    )
  }

  return (
    <div className={`auth-control-wrap ${className}`} ref={wrapRef}>
      <button
        type="button"
        className="auth-control auth-control--account"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {avatar}
        <span className="auth-control__name">{user.displayName?.split(' ')[0] || 'Account'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="auth-menu"
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="auth-menu__identity">
              <span className="auth-menu__name">{user.displayName || 'Your account'}</span>
              <span className="auth-menu__email">{user.email}</span>
            </div>
            <Link to="/settings" className="auth-menu__item" role="menuitem" onClick={() => setOpen(false)}>
              <IconSettings /> Settings
            </Link>
            <button
              type="button"
              className="auth-menu__item auth-menu__item--danger"
              role="menuitem"
              onClick={handleSignOut}
              disabled={busy}
            >
              <IconLogout /> {busy ? 'Signing out...' : 'Log out'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
