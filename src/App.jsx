import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/layout/NavBar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Privacy from './pages/Privacy'

// Code-split: the tracker page (and everything it needs - Firestore
// queries, the chart) should never be part of the initial bundle that
// every visitor downloads, only fetched when someone actually opens it.
const Tracker = lazy(() => import('./pages/Tracker'))

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
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
