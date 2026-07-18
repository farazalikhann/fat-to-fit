import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStats } from '../../context/StatsContext'
import { generatePdfReport } from '../../utils/pdfReport'
import { IconDownload } from './Icons'
import './PdfDownloadButton.css'

export default function PdfDownloadButton({ className = '' }) {
  const { stats } = useStats()
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    if (busy) return
    setBusy(true)
    try {
      await generatePdfReport(stats)
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
