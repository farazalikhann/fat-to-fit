import { useState } from 'react'
import { motion } from 'framer-motion'
import { generateTrackerReport } from '../../utils/pdfReport'
import { IconDownload } from '../shared/Icons'
import '../shared/PdfDownloadButton.css'

export default function TrackerPdfButton({ userName, chartDays, className = '' }) {
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    if (busy) return
    setBusy(true)
    try {
      await generateTrackerReport({ userName, chartDays })
    } finally {
      setBusy(false)
    }
  }

  return (
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
  )
}
