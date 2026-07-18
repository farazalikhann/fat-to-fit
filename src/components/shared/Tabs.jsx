import { motion } from 'framer-motion'
import './Tabs.css'

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          className={`tabs__btn ${active === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="tabs__icon">{tab.icon}</span>
          {tab.label}
          {active === tab.id && (
            <motion.span
              layoutId="tabs-indicator"
              className="tabs__indicator"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
