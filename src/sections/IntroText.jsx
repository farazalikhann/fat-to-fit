import Reveal from '../components/shared/Reveal'
import './IntroText.css'

export default function IntroText() {
  return (
    <section className="intro-text">
      <div className="container">
        <Reveal>
          <p className="intro-text__p">
            Sprout is a free calorie calculator built for people in the USA who want real
            numbers, not guesswork. Enter your age, height, and weight once to get your TDEE,
            BMR, and a personalized macro plan — then use the built-in BMI, ideal weight, water
            intake, and body fat calculators to see the full picture. Snap a photo of your meal
            and Sprout's AI estimates the calories and macros instantly, so tracking takes
            seconds instead of minutes. No account, no credit card, and no ads blocking your
            results — just the calculator you'll actually keep using.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
