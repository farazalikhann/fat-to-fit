import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Tabs from '../components/shared/Tabs'
import StatsChip from '../components/layout/StatsChip'
import PdfDownloadButton from '../components/shared/PdfDownloadButton'
import CalorieCalculator from '../calculators/CalorieCalculator'
import MacroCalculator from '../calculators/MacroCalculator'
import BMICalculator from '../calculators/BMICalculator'
import IdealWeightCalculator from '../calculators/IdealWeightCalculator'
import WaterIntakeCalculator from '../calculators/WaterIntakeCalculator'
import BodyFatCalculator from '../calculators/BodyFatCalculator'
import MealAnalyzer from '../calculators/MealAnalyzer'
import { IconFlame, IconMacro, IconScale, IconRuler, IconDroplet, IconBody, IconSparkle } from '../components/shared/Icons'
import './ToolsSection.css'

const TABS = [
  { id: 'calories', label: 'Calories', icon: <IconFlame />, Component: CalorieCalculator },
  { id: 'macros', label: 'Macros', icon: <IconMacro />, Component: MacroCalculator },
  { id: 'bmi', label: 'BMI', icon: <IconScale />, Component: BMICalculator },
  { id: 'ideal', label: 'Ideal Weight', icon: <IconRuler />, Component: IdealWeightCalculator },
  { id: 'water', label: 'Water', icon: <IconDroplet />, Component: WaterIntakeCalculator },
  { id: 'bodyfat', label: 'Body Fat', icon: <IconBody />, Component: BodyFatCalculator },
  { id: 'meal-ai', label: 'AI Meal', icon: <IconSparkle />, Component: MealAnalyzer },
]

export default function ToolsSection() {
  const [searchParams] = useSearchParams()
  const [active, setActive] = useState(() => {
    const requested = searchParams.get('tool')
    return TABS.some((t) => t.id === requested) ? requested : 'calories'
  })
  const ActiveComponent = TABS.find((t) => t.id === active)?.Component ?? CalorieCalculator

  // Lets other parts of the home page (e.g. the quick-access cards) jump
  // straight to a specific calculator via `?tool=<id>`, even after this
  // section is already mounted.
  useEffect(() => {
    const requested = searchParams.get('tool')
    if (requested && TABS.some((t) => t.id === requested) && requested !== active) {
      setActive(requested)
    }
  }, [searchParams])

  return (
    <section id="tools" className="tools">
      <div className="container">
        <div className="tools__header">
          <span className="tools__eyebrow">The toolkit</span>
          <h2>Seven tools. One set of numbers.</h2>
        </div>

        <div className="tools__layout">
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
