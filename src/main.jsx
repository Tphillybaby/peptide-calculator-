import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/i18n' // Initialize i18n
import './index.css'
import App from './App.jsx'

import { HelmetProvider } from 'react-helmet-async'

import { initSentry } from './lib/sentry'

// Initialize Sentry as early as possible
initSentry()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
