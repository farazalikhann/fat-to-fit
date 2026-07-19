import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/layout/NavBar'
import Footer from './components/layout/Footer'
import BottomNav from './components/layout/BottomNav'
import Home from './pages/Home'
import About from './pages/About'
import Privacy from './pages/Privacy'

// Code-split: the tracker and settings pages (and everything they need -
// Firestore queries, the chart) should never be part of the initial bundle
// that every visitor downloads, only fetched when someone actually opens them.
const Tracker = lazy(() => import('./pages/Tracker'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <>
      <div className="grain-overlay" />
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route
            path="/tracker"
            element={
              <Suspense fallback={null}>
                <Tracker />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={null}>
                <Settings />
              </Suspense>
            }
          />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}

export default App
