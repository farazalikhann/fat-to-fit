import { useStats } from '../../context/StatsContext'
import { cmToFtIn, kgToLbs, round } from '../../utils/units'
import { ACTIVITY_LEVELS } from '../../utils/calculations'
import './StatsChip.css'

export default function StatsChip() {
  const { stats } = useStats()
  const { ft, inch } = cmToFtIn(stats.heightCm)
  const activityLabel = ACTIVITY_LEVELS.find((a) => a.id === stats.activityLevel)?.label

  const scrollToPanel = () => {
    document.getElementById('hero-calc')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button type="button" className="stats-chip" onClick={scrollToPanel}>
      <span className="stats-chip__dot" />
      <span>{stats.gender === 'female' ? 'Female' : 'Male'}</span>
      <span className="stats-chip__sep">·</span>
      <span>{stats.age} yrs</span>
      <span className="stats-chip__sep">·</span>
      <span>
        {ft}'{inch}"
      </span>
      <span className="stats-chip__sep">·</span>
      <span>{round(kgToLbs(stats.weightKg))} lb</span>
      <span className="stats-chip__sep">·</span>
      <span>{activityLabel}</span>
      <span className="stats-chip__edit">Edit</span>
    </button>
  )
}
