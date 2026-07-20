import { useStats } from '../context/StatsContext'
import { Field, NumberInput, SegmentedToggle, PillGroup } from '../components/shared/Inputs'
import { ACTIVITY_LEVELS } from '../utils/calculations'
import { cmToFtIn, ftInToCm, kgToLbs, lbsToKg, round } from '../utils/units'
import './SharedStatsPanel.css'

export default function SharedStatsPanel({
  eyebrow = 'Your stats',
  title = 'Enter once, use everywhere',
  id = 'shared-stats',
  headingLevel = 'h3',
}) {
  const { stats, patch } = useStats()
  const { ft, inch } = cmToFtIn(stats.heightCm)
  const weightDisplay =
    stats.weightUnit === 'kg' ? round(stats.weightKg, 1) : round(kgToLbs(stats.weightKg), 1)
  const Heading = headingLevel

  return (
    <div id={id} className="stats-panel organic-3">
      <div className="stats-panel__head">
        <span className="stats-panel__eyebrow">{eyebrow}</span>
        <Heading className="stats-panel__title">{title}</Heading>
      </div>

      <div className="stats-panel__grid">
        <Field label="Gender">
          <SegmentedToggle
            options={[
              { value: 'female', label: 'Female' },
              { value: 'male', label: 'Male' },
            ]}
            value={stats.gender}
            onChange={(gender) => patch({ gender })}
          />
        </Field>

        <Field label="Age">
          <NumberInput
            value={stats.age}
            min={13}
            max={100}
            suffix="years"
            onChange={(age) => patch({ age: age === '' ? '' : age })}
          />
        </Field>

        <Field label="Height" full>
          <SegmentedToggle
            options={[
              { value: 'ft', label: 'ft / in' },
              { value: 'cm', label: 'cm' },
            ]}
            value={stats.heightUnit}
            onChange={(heightUnit) => patch({ heightUnit })}
          />
          {stats.heightUnit === 'ft' ? (
            <div className="stats-panel__pair">
              <NumberInput
                value={ft}
                min={3}
                max={8}
                suffix="ft"
                onChange={(v) => patch({ heightCm: ftInToCm(v, inch) })}
              />
              <NumberInput
                value={inch}
                min={0}
                max={11}
                suffix="in"
                onChange={(v) => patch({ heightCm: ftInToCm(ft, v) })}
              />
            </div>
          ) : (
            <NumberInput
              value={round(stats.heightCm)}
              min={100}
              max={230}
              suffix="cm"
              onChange={(v) => patch({ heightCm: v === '' ? '' : v })}
            />
          )}
        </Field>

        <Field label="Weight" full>
          <SegmentedToggle
            options={[
              { value: 'lbs', label: 'lbs' },
              { value: 'kg', label: 'kg' },
            ]}
            value={stats.weightUnit}
            onChange={(weightUnit) => patch({ weightUnit })}
          />
          <NumberInput
            value={weightDisplay}
            min={30}
            max={500}
            suffix={stats.weightUnit}
            onChange={(v) =>
              patch({ weightKg: v === '' ? '' : stats.weightUnit === 'kg' ? v : lbsToKg(v) })
            }
          />
        </Field>
      </div>

      <Field label="Activity level">
        <PillGroup
          options={ACTIVITY_LEVELS}
          value={stats.activityLevel}
          onChange={(activityLevel) => patch({ activityLevel })}
          columns={2}
        />
      </Field>
    </div>
  )
}
