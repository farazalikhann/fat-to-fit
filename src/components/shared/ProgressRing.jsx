import { motion } from 'framer-motion'
import './ProgressRing.css'

export default function ProgressRing({
  size = 220,
  strokeWidth = 18,
  progress = 0.7,
  color = 'var(--surface-deep)',
  trackColor = 'var(--card-deep)',
  glow = false,
  children,
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, progress))

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      {glow && (
        <motion.div
          className="progress-ring__glow"
          style={{ background: color }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="progress-ring__svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          className="progress-ring__fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="progress-ring__content">{children}</div>
    </div>
  )
}
