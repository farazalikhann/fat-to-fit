import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { StatsProvider } from './context/StatsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <StatsProvider>
        <App />
      </StatsProvider>
    </BrowserRouter>
  </StrictMode>,
)
