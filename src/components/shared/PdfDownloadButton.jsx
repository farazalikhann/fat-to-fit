import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStats } from '../../context/StatsContext'
import { generatePdfReport } from '../../utils/pdfReport'
import { trackEvent } from '../../utils/analytics'
import { IconDownload } from './Icons'
import './PdfDownloadButton.css'

export default function PdfDownloadButton({ className = '' }) {
  const { stats } = useStats()
  const [busy, setBusy] = useState(false)
  const [tabNotice, setTabNotice] = useState('')

  const handleClick = async () => {
    if (busy) return
    setBusy(true)
    setTabNotice('')
    try {
      const result = await generatePdfReport(stats)
      trackEvent('pdf_download', { report_type: 'calculator' })
      if (result?.method === 'tab') setTabNotice(result.message || 'PDF opened in a new tab.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pdf-btn-wrap">
      <motion.button
        type="button"
        className={`pdf-btn ${className}`}
        onClick={handleClick}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        disabled={busy}
      >
        <IconDownload />
        {busy ? 'Preparing...' : 'Download PDF'}
      </motion.button>
      <AnimatePresence>
        {tabNotice && (
          <motion.p
            className="pdf-btn__notice"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {tabNotice}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
