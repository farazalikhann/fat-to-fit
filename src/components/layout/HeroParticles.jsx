import { motion, useReducedMotion } from 'framer-motion'
import { LeafLine } from './OrganicBlob'

const PARTICLES = [
  { top: '12%', left: '8%', size: 28, duration: 7, delay: 0, rotate: -18 },
  { top: '68%', left: '4%', size: 18, duration: 9, delay: 0.6, rotate: 10 },
  { top: '22%', left: '92%', size: 22, duration: 8, delay: 0.3, rotate: 24 },
  { top: '78%', left: '90%', size: 16, duration: 6.5, delay: 1, rotate: -8 },
  { top: '48%', left: '96%', size: 14, duration: 10, delay: 0.8, rotate: 16 },
]

export default function HeroParticles() {
  const reduce = useReducedMotion()

  return (
    <div className="hero-particles" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="hero-particles__item"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size, color: 'var(--sage)' }}
          initial={{ opacity: 0, y: 0, rotate: p.rotate }}
          animate={
            reduce
              ? { opacity: 0.5 }
              : {
                  opacity: [0.35, 0.6, 0.35],
                  y: [0, -16, 0],
                  rotate: [p.rotate, p.rotate + 6, p.rotate],
                }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: reduce ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        >
          <LeafLine />
        </motion.div>
      ))}
    </div>
  )
}
