import { motion } from 'framer-motion'

const GLASS_W = 34
const GLASS_H = 52

function Glass({ index }) {
  const clipId = `glass-clip-${index}`
  return (
    <svg width={GLASS_W} height={GLASS_H} viewBox={`0 0 ${GLASS_W} ${GLASS_H}`}>
      <defs>
        <clipPath id={clipId}>
          <path d={`M4 2 H${GLASS_W - 4} L${GLASS_W - 8} ${GLASS_H - 4} Q${GLASS_W / 2} ${GLASS_H} 8 ${GLASS_H - 4} Z`} />
        </clipPath>
      </defs>
      <path
        d={`M4 2 H${GLASS_W - 4} L${GLASS_W - 8} ${GLASS_H - 4} Q${GLASS_W / 2} ${GLASS_H} 8 ${GLASS_H - 4} Z`}
        fill="none"
        stroke="#52796F"
        strokeWidth="1.5"
        opacity="0.35"
      />
      <g clipPath={`url(#${clipId})`}>
        <motion.rect
          x="0"
          width={GLASS_W}
          fill="url(#water-gradient)"
          initial={{ y: GLASS_H, height: GLASS_H }}
          animate={{ y: 6, height: GLASS_H }}
          transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </g>
    </svg>
  )
}

export default function BottleFill({ liters, cupSizeL = 0.25, maxGlasses = 14 }) {
  const glassCount = Math.min(maxGlasses, Math.max(1, Math.round(liters / cupSizeL)))

  return (
    <div className="bottle-fill">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="water-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B4E33D" />
            <stop offset="100%" stopColor="#52796F" />
          </linearGradient>
        </defs>
      </svg>
      <div className="bottle-fill__glasses">
        {Array.from({ length: glassCount }).map((_, i) => (
          <Glass key={i} index={i} />
        ))}
      </div>
    </div>
  )
}
