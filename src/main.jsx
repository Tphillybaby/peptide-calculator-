import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/i18n' // Initialize i18n
import './index.css'
import App from './App.jsx'

import { HelmetProvider } from 'react-helmet-async'

import { initSentry } from './lib/sentry'

// Initialize Sentry as early as possible
initSentry()
// Service worker is registered by VitePWA inline mode with built-in error handling

// Handle stale deployment chunk/CSS errors by auto-reloading once.
// After Vercel deploys a new version, users with cached HTML may reference
// assets (e.g. PromotionalAuthPopup--nNkX2aS.css) that no longer exist.
window.addEventListener('vite:preloadError', (event) => {
  // Never reload on the /callback route — that would invalidate the
  // single-use OAuth ?code= param from Google and break login.
  if (window.location.pathname === '/callback') {
    event.preventDefault();
    return;
  }
  const lastReload = sessionStorage.getItem('chunk_reload_time');
  const now = Date.now();
  // Only reload once per 30 seconds to prevent infinite loops
  if (!lastReload || now - parseInt(lastReload) > 30000) {
    sessionStorage.setItem('chunk_reload_time', now.toString());
    window.location.reload();
  }
  // Prevent the error from propagating to Sentry / global error handler
  event.preventDefault();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)

// Dispatch render-complete event for prerendering
// This signals to the prerenderer that the initial render is done
window.addEventListener('load', () => {
  setTimeout(() => {
    document.dispatchEvent(new Event('render-complete'));
  }, 500);
});
