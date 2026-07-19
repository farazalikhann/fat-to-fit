import { NavLink } from 'react-router-dom'
import { IconHome, IconNotebook, IconSettings } from '../shared/Icons'
import './BottomNav.css'

const ITEMS = [
  { to: '/', label: 'Home', icon: IconHome, end: true },
  { to: '/tracker', label: 'My Tracker', icon: IconNotebook },
  { to: '/settings', label: 'Settings', icon: IconSettings },
]

// Mobile-first primary navigation, fixed to the bottom of the viewport
// (hidden on wider screens where the top NavBar already covers this).
export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
