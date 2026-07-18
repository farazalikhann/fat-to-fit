import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

// zones: [{ from, to, color }] in domain units. value + domain [min,max].
export default function Gauge({ value, domainMin, domainMax, zones, size = 280 }) {
  const width = size
  const height = size * 0.62
  const cx = width / 2
  const cy = height - 12
  const r = width / 2 - 16
  const strokeWidth = 22
  const needleRef = useRef(null)
  const prevAngle = useRef(-90)

  const toGaugeAngle = (v) => {
    const fraction = Math.max(0, Math.min(1, (v - domainMin) / (domainMax - domainMin)))
    return -90 + fraction * 180
  }

  const toXY = (gAngleDeg) => {
    const theta = ((90 - gAngleDeg) * Math.PI) / 180
    return {
      x: cx + r * Math.cos(theta),
      y: cy - r * Math.sin(theta),
    }
  }

  const describeArc = (gStart, gEnd) => {
    const p1 = toXY(gStart)
    const p2 = toXY(gEnd)
    const largeArc = gEnd - gStart > 180 ? 1 : 0
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`
  }

  useEffect(() => {
    const target = toGaugeAngle(value)
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      needleRef.current?.setAttribute('transform', `rotate(${target} ${cx} ${cy})`)
      prevAngle.current = target
      return
    }

    const controls = animate(prevAngle.current, target, {
      type: 'spring',
      stiffness: 90,
      damping: 16,
      onUpdate(latest) {
        needleRef.current?.setAttribute('transform', `rotate(${latest} ${cx} ${cy})`)
      },
    })
    prevAngle.current = target
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div style={{ width, position: 'relative' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {zones.map((z, i) => (
          <path
            key={i}
            d={describeArc(toGaugeAngle(z.from), toGaugeAngle(z.to))}
            fill="none"
            stroke={z.color}
            strokeWidth={strokeWidth}
            strokeLinecap={i === 0 || i === zones.length - 1 ? 'round' : 'butt'}
          />
        ))}
        <line
          ref={needleRef}
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - r + strokeWidth * 1.4}
          stroke="#14281D"
          strokeWidth={4}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <circle cx={cx} cy={cy} r={9} fill="#14281D" />
        <circle cx={cx} cy={cy} r={4} fill="#C5F547" />
      </svg>
    </div>
  )
}
