import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../sections/Hero'
import ToolsSection from '../sections/ToolsSection'
import ContentSEO from '../sections/ContentSEO'
import FAQ from '../sections/FAQ'

export default function Home() {
  const location = useLocation()

  useEffect(() => {
    document.title = 'Calorie Calculator — Free TDEE, Macro & BMI Calculator | Sprout'
    if (location.hash) {
      const id = location.hash.replace('#', '')
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [location.hash])

  return (
    <>
      <Hero />
      <ToolsSection />
      <ContentSEO />
      <FAQ />
    </>
  )
}
