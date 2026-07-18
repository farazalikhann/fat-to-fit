import { motion } from 'framer-motion'

// segments: [{ value, color, label }]
export default function DonutChart({ segments, size = 200, strokeWidth = 26 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1

  let cumulative = 0
  const arcs = segments.map((s) => {
    const fraction = s.value / total
    const start = cumulative
    cumulative += fraction
    return { ...s, fraction, start }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E6ECDD"
        strokeWidth={strokeWidth}
      />
      {arcs.map((arc, i) => {
        const len = arc.fraction * circumference
        const gap = circumference - len
        const rotation = arc.start * 360 - 90
        return (
          <motion.circle
            key={arc.label ?? i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={`${len} ${gap}`}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${len} ${gap}` }}
            transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          />
        )
      })}
    </svg>
  )
}
