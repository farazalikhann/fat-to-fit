import { motion } from 'framer-motion'
import HeroParticles from '../components/layout/HeroParticles'
import { BlobOne, BlobTwo } from '../components/layout/OrganicBlob'
import './Hero.css'

export default function Hero() {
  const scrollToTools = () => {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero">
      <HeroParticles />
      <BlobOne className="hero__blob hero__blob--one" />
      <BlobTwo className="hero__blob hero__blob--two" />

      <div className="container hero__inner">
        <motion.div
          className="hero__copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hero__eyebrow">Free · science-backed · takes 30 seconds</span>
          <h1 className="hero__title">
            Free Calorie Calculator.
            <br />
            <span className="hero__title--accent">Know your numbers, reach your goals.</span>
          </h1>
          <p className="hero__sub">
            The Mifflin-St Jeor calorie calculator, TDEE, macros, BMI, ideal weight, water
            intake and body fat — one clean toolkit instead of six different tabs.
          </p>
          <div className="hero__actions">
            <button className="btn btn-primary" onClick={scrollToTools}>
              Calculate my calories →
            </button>
            <a className="btn btn-ghost" href="#how-we-calculate">
              How it works
            </a>
          </div>
          <div className="hero__trust">
            <div>
              <strong>7</strong>
              <span>tools</span>
            </div>
            <div>
              <strong>0</strong>
              <span>signup required</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>free, always</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero__visual organic-3"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hero__visual-label">Estimated daily target</span>
          <span className="hero__visual-number">2,150</span>
          <span className="hero__visual-unit">kcal / day</span>
          <div className="hero__visual-bar">
            <motion.div
              className="hero__visual-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="hero__visual-caption">Based on Mifflin-St Jeor + moderate activity</span>
        </motion.div>
      </div>
    </section>
  )
}
