import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './OfflineBanner.css'

function useOnlineStatus() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}

// Calculators keep working offline (they're pure client-side math, no
// network involved) - this is only a heads-up for the two features that
// genuinely need a connection: the AI Meal Analyzer and syncing My Tracker.
export default function OfflineBanner() {
  const online = useOnlineStatus()

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          className="offline-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="container offline-banner__inner">
            You&apos;re offline — calculators still work, but AI features and My Tracker sync need
            an internet connection.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
