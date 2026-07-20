import { Link } from 'react-router-dom'
import { useSeo } from '../utils/seo'
import Reveal from '../components/shared/Reveal'
import './StaticPage.css'

export default function About() {
  useSeo({
    title: 'About Sprout — Free Calorie & Health Calculators',
    description:
      "Learn about Sprout's free calorie, BMI, TDEE, and macro calculators - built on published nutrition formulas, with no signup and no hidden fees.",
    path: '/about',
  })

  return (
    <div className="container static-page">
      <Reveal>
        <span className="static-page__eyebrow">About</span>
        <h1>Built for people who just want a straight answer</h1>
      </Reveal>

      <div className="static-page__body">
        <Reveal delay={0.05}>
          <p>
            Sprout started from a simple frustration: every "free calorie calculator" online was
            either buried in ads, gated behind an email signup, or spread across six different
            websites for six related numbers. We wanted one clean place to get your BMR, TDEE,
            macros, BMI, ideal weight, water intake, and body fat estimate — using the same
            stats, calculated once.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2>Our approach</h2>
          <p>
            Every calculator on this site is built on published, peer-reviewed formulas —
            Mifflin-St Jeor for BMR/TDEE, the US Navy method for body fat, and the Devine,
            Robinson, and Hamwi equations for ideal weight. We don't invent proprietary "secret"
            formulas. You can see exactly how each number is calculated in the "How we
            calculate" section on the home page.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <h2>What Sprout is not</h2>
          <p>
            Sprout is an educational and planning tool, not a medical device or a substitute for
            professional care. It doesn't store your data on a server, diagnose conditions, or
            replace advice from a doctor or registered dietitian — especially if you have a
            medical condition, are pregnant, or have a history of disordered eating.
          </p>
        </Reveal>

        <Reveal delay={0.2} className="static-page__card">
          <h2>Your data stays with you</h2>
          <p>
            The stats you enter (age, weight, height, activity level) are saved in your browser's
            local storage so your numbers persist between visits. If you choose to sign in with
            Google, those same stats also sync to your private account so they follow you to a
            new device — that data is scoped to your account only, never visible to other users
            or used for anything beyond auto-filling your own calculators. See our{' '}
            <Link to="/privacy">Privacy Policy</Link> for details.
          </p>
        </Reveal>
      </div>
    </div>
  )
}
