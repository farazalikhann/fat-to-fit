import { useEffect, useRef } from 'react'
import { animate, useMotionValue } from 'framer-motion'

const defaultFormat = (n) => Math.round(n).toLocaleString('en-US')

export default function NumberCountUp({
  value,
  duration = 1.1,
  format = defaultFormat,
  className,
  as: Tag = 'span',
}) {
  const nodeRef = useRef(null)
  const motionValue = useMotionValue(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      if (nodeRef.current) nodeRef.current.textContent = format(value)
      prevValue.current = value
      return
    }

    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        if (nodeRef.current) nodeRef.current.textContent = format(latest)
      },
    })
    prevValue.current = value
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <Tag ref={nodeRef} className={className}>
      {format(0)}
    </Tag>
  )
}
