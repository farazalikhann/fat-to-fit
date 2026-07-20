import { motion } from 'framer-motion'
import HeroParticles from '../components/layout/HeroParticles'
import { BlobOne, BlobTwo } from '../components/layout/OrganicBlob'
import HeroCalculator from './HeroCalculator'
import './Hero.css'

export default function Hero() {
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
          <a className="hero__how-link" href="#how-we-calculate">
            See how we calculate it →
          </a>
        </motion.div>

        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroCalculator />
        </motion.div>
      </div>
    </section>
  )
}
