import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="nav__mark">
              <svg viewBox="0 0 48 48" width="26" height="26">
                <rect width="48" height="48" rx="14" fill="#C5F547" />
                <path
                  d="M13 34C13 22 21 13 35 12C36 24 30 33 20 35.5C17.5 36.1 14.8 35.6 13 34Z"
                  fill="#1B4332"
                />
              </svg>
            </span>
            <span>Sprout</span>
          </div>

          <nav className="footer__links">
            <a href="#tools">Calculators</a>
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </nav>
        </div>

        <p className="footer__disclaimer">
          <strong>Medical disclaimer:</strong> Sprout's calculators are for informational
          purposes only and are not a substitute for professional medical advice, diagnosis,
          or treatment. Always consult a qualified healthcare provider before making changes
          to your diet, exercise, or health routine.
        </p>

        <p className="footer__copy">
          © {new Date().getFullYear()} Sprout. Built with care for people chasing real goals.
        </p>
      </div>
    </footer>
  )
}
