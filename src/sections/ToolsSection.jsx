import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Tabs from '../components/shared/Tabs'
import StatsChip from '../components/layout/StatsChip'
import PdfDownloadButton from '../components/shared/PdfDownloadButton'
import SharedStatsPanel from './SharedStatsPanel'
import CalorieCalculator from '../calculators/CalorieCalculator'
import MacroCalculator from '../calculators/MacroCalculator'
import BMICalculator from '../calculators/BMICalculator'
import IdealWeightCalculator from '../calculators/IdealWeightCalculator'
import WaterIntakeCalculator from '../calculators/WaterIntakeCalculator'
import BodyFatCalculator from '../calculators/BodyFatCalculator'
import { IconFlame, IconMacro, IconScale, IconRuler, IconDroplet, IconBody } from '../components/shared/Icons'
import './ToolsSection.css'

const TABS = [
  { id: 'calories', label: 'Calories', icon: <IconFlame />, Component: CalorieCalculator },
  { id: 'macros', label: 'Macros', icon: <IconMacro />, Component: MacroCalculator },
  { id: 'bmi', label: 'BMI', icon: <IconScale />, Component: BMICalculator },
  { id: 'ideal', label: 'Ideal Weight', icon: <IconRuler />, Component: IdealWeightCalculator },
  { id: 'water', label: 'Water', icon: <IconDroplet />, Component: WaterIntakeCalculator },
  { id: 'bodyfat', label: 'Body Fat', icon: <IconBody />, Component: BodyFatCalculator },
]

export default function ToolsSection() {
  const [active, setActive] = useState('calories')
  const ActiveComponent = TABS.find((t) => t.id === active)?.Component ?? CalorieCalculator

  return (
    <section id="tools" className="tools">
      <div className="container">
        <div className="tools__header">
          <span className="tools__eyebrow">The toolkit</span>
          <h2>Six calculators. One set of numbers.</h2>
        </div>

        <div className="tools__layout">
          <div className="tools__panel">
            <SharedStatsPanel />
          </div>

          <div className="tools__content">
            <div className="tools__content-top">
              <Tabs tabs={TABS} active={active} onChange={setActive} />
              <div className="tools__content-top-right">
                <StatsChip />
                <PdfDownloadButton />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
