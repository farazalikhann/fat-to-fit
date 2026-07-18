import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '../shared/ThemeToggle'
import './NavBar.css'

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const goToTools = (e) => {
    e.preventDefault()
    setOpen(false)
    if (location.pathname !== '/') {
      navigate('/#tools')
      return
    }
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand" onClick={() => setOpen(false)}>
          <span className="nav__mark">
            <svg viewBox="0 0 48 48" width="30" height="30">
              <rect width="48" height="48" rx="14" fill="#1B4332" />
              <path
                d="M13 34C13 22 21 13 35 12C36 24 30 33 20 35.5C17.5 36.1 14.8 35.6 13 34Z"
                fill="#C5F547"
              />
            </svg>
          </span>
          Sprout
        </Link>

        <nav className="nav__links">
          <a href="#tools" onClick={goToTools}>
            Calculators
          </a>
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
        </nav>

        <a href="#tools" className="btn btn-primary nav__cta" onClick={goToTools}>
          Get your numbers
        </a>

        <ThemeToggle className="nav__theme-toggle" />

        <button
          className="nav__burger"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="nav__mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <a href="#tools" onClick={goToTools}>
              Calculators
            </a>
            <Link to="/about" onClick={() => setOpen(false)}>
              About
            </Link>
            <Link to="/privacy" onClick={() => setOpen(false)}>
              Privacy
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
