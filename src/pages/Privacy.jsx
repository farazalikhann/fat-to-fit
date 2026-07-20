import { useSeo } from '../utils/seo'
import Reveal from '../components/shared/Reveal'
import './StaticPage.css'

export default function Privacy() {
  useSeo({
    title: 'Privacy Policy — Sprout',
    description:
      "Sprout's privacy policy: what data our free calorie and health calculators collect, how AI meal analysis and account sync work, and your choices.",
    path: '/privacy',
  })

  return (
    <div className="container static-page">
      <Reveal>
        <span className="static-page__eyebrow">Legal</span>
        <h1>Privacy Policy</h1>
        <span className="static-page__updated">Last updated: July 19, 2026</span>
      </Reveal>

      <div className="static-page__body">
        <Reveal delay={0.05}>
          <h2>Overview</h2>
          <p>
            Sprout ("we," "us," or "our") provides free health and calorie calculators at this
            website (the "Service"). This Privacy Policy explains what information is collected
            when you use the Service and how it's handled. By using Sprout, you agree to the
            terms described here.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2>Information you enter into calculators</h2>
          <p>
            The health information you enter — age, weight, height, activity level, and body
            measurements — is processed entirely in your browser to perform calculations. By
            default this data is stored only in your browser's local storage so it persists
            between visits on the same device, and we do not transmit, collect, or store it on
            our servers. If you choose to sign in with a Google account, your gender, age,
            height, weight, and activity level are additionally saved to a private Firestore
            database record tied only to your account (so they auto-fill on your next visit or
            device); the same applies to your food diary and daily calorie goal if you use My
            Tracker. This account data is protected by security rules that restrict it to your
            own signed-in account only — no other user or visitor can read or write it, and we
            do not use it for anything beyond providing the Service back to you. Signing in is
            entirely optional; every calculator continues to work without an account.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <h2>Analytics</h2>
          <p>
            We use Google Analytics (GA4) to understand aggregate site usage — such as which
            pages are visited and how long visits last — so we can improve the Service. Google
            Analytics uses cookies and collects data like your approximate location, device
            type, and browsing behavior on this site. This information is anonymized and
            aggregated; it is not linked to the health data you enter into calculators.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <h2>Advertising</h2>
          <p>
            Sprout may display advertisements served by Google AdSense and other third-party ad
            networks. These providers may use cookies, device identifiers, or similar
            technologies to serve ads based on your prior visits to this or other websites. You
            can opt out of personalized advertising by visiting{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noreferrer">
              Google Ads Settings
            </a>{' '}
            or{' '}
            <a href="https://optout.aboutads.info" target="_blank" rel="noreferrer">
              aboutads.info
            </a>
            .
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <h2>Cookies</h2>
          <p>
            Cookies are small text files placed on your device by your browser. We use them (via
            Google Analytics and advertising partners) to remember preferences and measure site
            performance. You can disable cookies in your browser settings, though some features
            of the Service may not function as intended without them.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <h2>Third-party links</h2>
          <p>
            The Service may contain links to third-party websites. We are not responsible for
            the privacy practices or content of those sites. We encourage you to review the
            privacy policy of any site you visit.
          </p>
        </Reveal>

        <Reveal delay={0.35}>
          <h2>Children's privacy</h2>
          <p>
            Sprout is not directed at children under 13, and we do not knowingly collect
            personal information from children under 13.
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <h2>Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated "Last updated" date.
          </p>
        </Reveal>

        <Reveal delay={0.45} className="static-page__card">
          <h2>Contact us</h2>
          <p>
            If you have questions about this Privacy Policy, you can reach us at{' '}
            <strong>hello@sproutcalc.com</strong>.
          </p>
        </Reveal>
      </div>
    </div>
  )
}
