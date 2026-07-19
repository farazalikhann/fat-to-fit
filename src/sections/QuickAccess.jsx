import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { IconHome, IconNotebook, IconMacro, IconFlame } from '../components/shared/Icons'
import Spinner from '../components/shared/Spinner'
import './QuickAccess.css'

const CARDS = [
  {
    id: 'dashboard',
    title: 'Access your personal dashboard',
    description: 'Your progress, saved stats, and daily goal in one place.',
    icon: IconHome,
    gated: true,
  },
  {
    id: 'diet',
    title: 'Calculate your diet',
    description: 'Get a protein, carb, and fat plan built around your goal.',
    icon: IconMacro,
    tool: 'macros',
  },
  {
    id: 'calories',
    title: 'Calculate your calories',
    description: 'Find your BMR, TDEE, and a daily calorie target.',
    icon: IconFlame,
    tool: 'calories',
  },
  {
    id: 'track',
    title: 'Track your calories',
    description: 'Log meals with AI or by hand and watch your daily total.',
    icon: IconNotebook,
    gated: true,
  },
]

export default function QuickAccess() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  const handleToolClick = (toolId) => {
    navigate(`/?tool=${toolId}#tools`)
  }

  const handleGatedClick = async (cardId) => {
    if (user) {
      navigate('/tracker')
      return
    }
    setBusyId(cardId)
    setError('')
    try {
      await signIn()
      navigate('/tracker')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="quick-access">
      <div className="container">
        <div className="quick-access__grid">
          {CARDS.map((card, i) => {
            const Icon = card.icon
            const busy = busyId === card.id
            return (
              <motion.button
                key={card.id}
                type="button"
                className={`quick-access__card organic-${(i % 4) + 1} ${card.gated && !user ? 'quick-access__card--gated' : ''}`}
                onClick={() => (card.gated ? handleGatedClick(card.id) : handleToolClick(card.tool))}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                disabled={busy}
              >
                <span className="quick-access__icon">
                  {busy ? <Spinner size={18} /> : <Icon />}
                </span>
                <span className="quick-access__text">
                  <span className="quick-access__title">{card.title}</span>
                  <span className="quick-access__desc">{card.description}</span>
                </span>
                {card.gated && !user && (
                  <span className="quick-access__badge">Sign in</span>
                )}
              </motion.button>
            )
          })}
        </div>
        {error && <p className="quick-access__error">{error}</p>}
      </div>
    </section>
  )
}
