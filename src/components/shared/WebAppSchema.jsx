// JSON-LD WebApplication schema, rendered once on the homepage - tells
// Google this is a free, browser-based health calculator tool (not, say, a
// blog post or product page), which can surface it differently in results
// (e.g. with a "Free" price badge).
const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Sprout',
  url: 'https://fatfit.club',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Free calorie, BMI, TDEE and macro calculator with an AI meal photo scanner - no signup required.',
}

export default function WebAppSchema() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
