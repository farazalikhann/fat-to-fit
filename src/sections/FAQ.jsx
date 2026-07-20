import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Reveal from '../components/shared/Reveal'
import './FAQ.css'

const FAQS = [
  {
    q: 'How many calories should I eat per day?',
    a: 'Your daily calorie needs depend on your age, height, weight, gender, and activity level. Enter your stats once and our free TDEE calculator instantly shows your maintenance calories, plus targets for losing or gaining weight at a safe, sustainable rate.',
  },
  {
    q: 'How accurate is this calorie calculator?',
    a: "This calculator uses the Mifflin-St Jeor equation, which research shows is accurate for about 82% of people within 10% of their true measured metabolic rate — making it the most reliable equation available without lab testing (like indirect calorimetry). Individual results can still vary with muscle mass, genetics, medications, and hormones, so treat the number as a well-informed starting point, not a lab result.",
  },
  {
    q: "What's the difference between BMR and TDEE?",
    a: 'BMR (Basal Metabolic Rate) is the energy your body needs at complete rest just to stay alive. TDEE (Total Daily Energy Expenditure) is your BMR plus the calories burned through daily movement, exercise, and digestion. TDEE is your real "maintenance calories" number — the one to use when setting a weight loss or weight gain target.',
  },
  {
    q: 'How many calories should I eat to lose weight?',
    a: 'Most guidelines recommend a deficit of 500–1,000 calories per day below your TDEE, which produces a safe, sustainable loss of about 1–2 pounds per week. Larger deficits can speed up short-term results but increase the risk of muscle loss, fatigue, and rebound weight gain.',
  },
  {
    q: 'What macro split should I use for weight loss?',
    a: 'There is no single "correct" split — total calories matter most for weight loss, while macros affect satiety, muscle retention, and adherence. A balanced 30/40/30 (protein/carbs/fat) split works well for most people; a higher-protein split (35–40% protein) can help preserve muscle during a deficit, and lower-carb splits may suit people who feel better with fewer carbohydrates.',
  },
  {
    q: 'Is BMI a good measure of health?',
    a: "BMI is a fast screening tool, not a diagnosis. It doesn't distinguish between muscle and fat, so muscular athletes often score as 'overweight' despite low body fat, while people with low muscle mass can have a 'normal' BMI despite high body fat. Use it alongside other measurements — like body fat percentage or waist circumference — for a fuller picture.",
  },
  {
    q: 'How much water should I drink per day?',
    a: "A common starting point is roughly 0.5–0.7 fl oz per pound of body weight per day, adjusted upward for exercise, heat, or high altitude. Our water intake calculator uses your body weight and activity level to give a personalized daily target, but thirst, urine color, and your doctor's guidance are the best day-to-day indicators.",
  },
  {
    q: 'How accurate is the AI meal photo scanner?',
    a: "The AI Meal Analyzer estimates calories and macros from a food photo or a plain-text description using standard nutrition database values, including common Indian and South Asian dishes. It's a fast, convenient estimate for everyday tracking — genuinely useful for spotting patterns over time — but like any photo-based estimate it can vary from a nutrition label or a registered dietitian's assessment, especially for mixed dishes or unusual portion sizes.",
  },
  {
    q: 'Is this calculator free to use?',
    a: 'Yes — every calculator on Sprout (calories, TDEE, BMI, macros, ideal weight, water intake, and body fat) is completely free in the USA and everywhere else, with no signup, subscription, or hidden fees. Creating a free account is optional and only needed if you want to save your meal history and daily progress across visits.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <section className="faq" id="faq">
      <div className="container">
        <Reveal>
          <span className="faq__eyebrow">FAQ</span>
          <h2 className="faq__title">Questions people actually ask</h2>
        </Reveal>

        <div className="faq__list">
          {FAQS.map((item, i) => {
            const open = openIndex === i
            return (
              <Reveal key={item.q} delay={i * 0.04} className="faq__item">
                <button
                  className="faq__question"
                  onClick={() => setOpenIndex(open ? -1 : i)}
                  aria-expanded={open}
                >
                  {item.q}
                  <span className={`faq__icon ${open ? 'is-open' : ''}`}>+</span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      className="faq__answer-wrap"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="faq__answer">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            )
          })}
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  )
}
