import Reveal from '../components/shared/Reveal'
import './ContentSEO.css'

export default function ContentSEO() {
  return (
    <section className="content-seo" id="how-we-calculate">
      <div className="container">
        <Reveal>
          <span className="content-seo__eyebrow">The science</span>
          <h2 className="content-seo__title">How the numbers actually work</h2>
        </Reveal>

        <article className="content-block">
          <Reveal className="content-block__index">01</Reveal>
          <Reveal delay={0.05} className="content-block__body">
            <h3>How we calculate your calories</h3>
            <p>
              Sprout's calorie calculator uses the <strong>Mifflin-St Jeor equation</strong>,
              the formula most dietitians and clinical nutritionists rely on today. Published in
              1990, it replaced the older Harris-Benedict equation because it more accurately
              predicts resting energy expenditure across a wider range of body types.
            </p>
            <p>
              The equation uses four inputs — weight, height, age, and gender — to estimate your
              Basal Metabolic Rate (BMR), then multiplies that number by an activity factor to
              get your Total Daily Energy Expenditure (TDEE):
            </p>
            <div className="content-block__formula">
              <p>Men: BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5</p>
              <p>Women: BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161</p>
            </div>
            <p>
              No formula is perfect — individual metabolism varies with muscle mass, genetics,
              and hormones — but Mifflin-St Jeor is accurate for roughly 82% of people within
              10% of their true measured metabolic rate, which is why it's the standard used in
              this calculator.
            </p>
          </Reveal>
        </article>

        <article className="content-block content-block--reverse">
          <Reveal delay={0.05} className="content-block__body">
            <h3>Understanding BMR vs. TDEE</h3>
            <p>
              <strong>BMR (Basal Metabolic Rate)</strong> is the energy your body burns at
              complete rest just to keep your heart beating, lungs breathing, and cells
              functioning — if you stayed in bed all day, this is roughly what you'd burn.
            </p>
            <p>
              <strong>TDEE (Total Daily Energy Expenditure)</strong> adds in everything else:
              walking, working, exercising, even fidgeting. It's your BMR multiplied by an
              activity multiplier ranging from 1.2 (sedentary) to 1.9 (extremely active).
            </p>
            <p>
              TDEE — not BMR — is your true "maintenance calories" number. Eating at your TDEE
              keeps your weight stable; eating below it creates the deficit needed for weight
              loss, and eating above it supports muscle gain or a healthy weight increase.
            </p>
          </Reveal>
          <Reveal className="content-block__index">02</Reveal>
        </article>

        <article className="content-block">
          <Reveal className="content-block__index">03</Reveal>
          <Reveal delay={0.05} className="content-block__body">
            <h3>Safe weight loss guidelines</h3>
            <p>
              The CDC and most clinical guidelines recommend losing no more than{' '}
              <strong>1–2 pounds per week</strong> for sustainable, muscle-sparing fat loss. That
              corresponds to a daily deficit of roughly 500–1,000 calories below your TDEE, since
              one pound of body fat is approximately 3,500 calories.
            </p>
            <p>
              Cutting calories more aggressively than this can lead to muscle loss, nutrient
              deficiencies, metabolic slowdown, and a much higher chance of regaining the weight.
              Very low-calorie diets (under 1,200 calories/day for most women or 1,500 for most
              men) should only be attempted under medical supervision.
            </p>
            <p>
              If you have a medical condition, are pregnant or breastfeeding, or have a history
              of disordered eating, talk to a doctor or registered dietitian before starting any
              calorie-restricted plan.
            </p>
          </Reveal>
        </article>
      </div>
    </section>
  )
}
