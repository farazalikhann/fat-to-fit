import { motion } from 'framer-motion'
import { useStats } from '../context/StatsContext'
import { Field, NumberInput } from '../components/shared/Inputs'
import ProgressRing from '../components/shared/ProgressRing'
import NumberCountUp from '../components/shared/NumberCountUp'
import { bodyFatNavy, bodyFatCategory } from '../utils/calculations'
import { cmToInches, inchesToCm, round } from '../utils/units'
import './BodyFatCalculator.css'

export default function BodyFatCalculator() {
  const { stats, patch } = useStats()
  const useInches = stats.heightUnit === 'ft'
  const unitLabel = useInches ? 'in' : 'cm'

  const toDisplay = (cm) => (cm === '' || cm == null ? '' : round(useInches ? cmToInches(cm) : cm, 1))
  const fromDisplay = (v) => (v === '' ? '' : useInches ? inchesToCm(v) : v)

  const needsHip = stats.gender === 'female'
  const ready =
    stats.waistCm !== '' &&
    stats.neckCm !== '' &&
    (!needsHip || stats.hipCm !== '')

  const bfPct = ready
    ? bodyFatNavy({
        gender: stats.gender,
        waistCm: Number(stats.waistCm),
        neckCm: Number(stats.neckCm),
        hipCm: Number(stats.hipCm || 0),
        heightCm: stats.heightCm,
      })
    : null

  const category = bfPct != null && isFinite(bfPct) ? bodyFatCategory(bfPct, stats.gender) : null

  return (
    <div className="bf-grid">
      <motion.div
        className="bf-inputs organic-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h4>US Navy method</h4>
        <p className="bf-inputs__hint">Measure at the narrowest point, in a relaxed (not sucked-in) position.</p>

        <Field label={`Neck (${unitLabel})`}>
          <NumberInput
            value={toDisplay(stats.neckCm)}
            step={0.1}
            suffix={unitLabel}
            onChange={(v) => patch({ neckCm: fromDisplay(v) })}
          />
        </Field>

        <Field label={`Waist (${unitLabel})`} hint="At the belly button">
          <NumberInput
            value={toDisplay(stats.waistCm)}
            step={0.1}
            suffix={unitLabel}
            onChange={(v) => patch({ waistCm: fromDisplay(v) })}
          />
        </Field>

        {needsHip && (
          <Field label={`Hip (${unitLabel})`} hint="At the widest point">
            <NumberInput
              value={toDisplay(stats.hipCm)}
              step={0.1}
              suffix={unitLabel}
              onChange={(v) => patch({ hipCm: fromDisplay(v) })}
            />
          </Field>
        )}
      </motion.div>

      <motion.div
        className="bf-result organic-1"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        {bfPct != null && isFinite(bfPct) && bfPct > 0 ? (
          <>
            <ProgressRing progress={Math.min(1, bfPct / 45)} size={190} strokeWidth={14} color="#FF8A5C" trackColor="var(--card-deep)">
              <NumberCountUp value={bfPct} format={(n) => n.toFixed(1) + '%'} className="bf-result__number" />
              <span className="bf-result__label">body fat</span>
            </ProgressRing>
            <span className="bf-result__badge">{category?.label}</span>
          </>
        ) : (
          <div className="bf-result__empty">
            <span className="bf-result__empty-icon">—</span>
            <p>Enter your neck{needsHip ? ', waist, and hip' : ' and waist'} measurements to see your estimate.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
