import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSeo } from '../utils/seo'
import WebAppSchema from '../components/shared/WebAppSchema'
import Hero from '../sections/Hero'
import IntroText from '../sections/IntroText'
import QuickAccess from '../sections/QuickAccess'
import ToolsSection from '../sections/ToolsSection'
import ContentSEO from '../sections/ContentSEO'
import FAQ from '../sections/FAQ'

export default function Home() {
  const location = useLocation()

  useSeo({
    title: 'Free Calorie Calculator, TDEE & BMI Calculator | Sprout',
    description:
      'Calculate your daily calorie needs, BMI, TDEE, and macros for free. Use AI to scan food photos and track meals instantly. No signup required.',
    path: '/',
  })

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [location.hash])

  return (
    <>
      <WebAppSchema />
      <Hero />
      <IntroText />
      <QuickAccess />
      <ToolsSection />
      <ContentSEO />
      <FAQ />
    </>
  )
}
