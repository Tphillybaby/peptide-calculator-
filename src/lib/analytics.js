/**
 * analytics.js — GA4 best-practice wrapper for PeptideLog
 *
 * Design decisions:
 * - GA4 script is loaded in index.html so window.gtag is always available here.
 * - This module only calls window.gtag; it never injects a <script> tag.
 * - No console.log in production (use IS_DEV guard for debugging).
 * - Consent Mode v2: analytics_storage is updated when the user accepts cookies.
 * - Bot/headless detection prevents polluting GA data.
 */

export const GA_MEASUREMENT_ID = 'G-2V2TNJFR16';

const IS_DEV = import.meta.env.DEV;

// ---------------------------------------------------------------------------
// Bot detection — runs once, cached
// ---------------------------------------------------------------------------
const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
  /googlebot/i, /bingbot/i, /yandex/i, /baiduspider/i,
  /facebookexternalhit/i, /twitterbot/i, /rogerbot/i, /linkedinbot/i,
  /embedly/i, /quora link preview/i, /showyoubot/i, /outbrain/i,
  /pinterest/i, /slackbot/i, /vkShare/i, /W3C_Validator/i,
  /whatsapp/i, /applebot/i, /headless/i, /phantom/i,
  /selenium/i, /puppeteer/i, /lighthouse/i, /pagespeed/i, /gtmetrix/i,
];

let _isRealUser = null;
const isRealUser = () => {
  if (_isRealUser !== null) return _isRealUser;
  const ua = navigator.userAgent || '';
  const isBot =
    BOT_PATTERNS.some(p => p.test(ua)) ||
    !!navigator.webdriver ||
    !navigator.languages?.length;
  _isRealUser = !isBot;
  if (IS_DEV && !_isRealUser) console.debug('[Analytics] Bot detected — disabled');
  return _isRealUser;
};

// ---------------------------------------------------------------------------
// Safe gtag caller — always check window.gtag exists
// ---------------------------------------------------------------------------
const gtag = (...args) => {
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
  }
};

// ---------------------------------------------------------------------------
// initAnalytics — call once at app startup (App.jsx useEffect)
// The GA script is already loaded by index.html. This function:
//   1. Verifies we're not a bot
//   2. Sets up scroll-depth tracking
// ---------------------------------------------------------------------------
export const initAnalytics = () => {
  if (!isRealUser()) return;
  if (IS_DEV) console.debug('[Analytics] Initialized (dev mode — events logged but not sent)');
  _setupScrollDepth();
};

// ---------------------------------------------------------------------------
// Consent Mode v2 — called by CookieConsent when the user makes a choice
// ---------------------------------------------------------------------------
export const updateConsent = (analyticsGranted) => {
  gtag('consent', 'update', {
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
  });
  if (IS_DEV) console.debug('[Analytics] Consent updated:', analyticsGranted ? 'granted' : 'denied');
};

// ---------------------------------------------------------------------------
// Page view — send rich GA4 page_view with title + location
// ---------------------------------------------------------------------------
export const trackPageView = (path) => {
  if (!isRealUser()) return;

  const title = document.title || 'PeptideLog';
  const location = `https://peptidelog.net${path}`;

  if (IS_DEV) console.debug(`[Analytics] page_view: ${path} ("${title}")`);

  gtag('event', 'page_view', {
    page_title: title,
    page_location: location,
    page_path: path,
  });
};

// ---------------------------------------------------------------------------
// Generic event — GA4 recommended event shape
// ---------------------------------------------------------------------------
export const trackEvent = (eventName, params = {}) => {
  if (!isRealUser()) return;
  if (IS_DEV) console.debug(`[Analytics] event: ${eventName}`, params);
  gtag('event', eventName, params);
};

// ---------------------------------------------------------------------------
// Specific high-value events for PeptideLog
// Call these from the relevant components/pages
// ---------------------------------------------------------------------------

/** User ran the peptide reconstitution calculator */
export const trackCalculation = ({ peptide, bac_volume_ml, peptide_mg, dose_mcg }) => {
  trackEvent('calculation_run', {
    event_category: 'Calculator',
    peptide_name: peptide || 'unknown',
    bac_volume_ml,
    peptide_mg,
    dose_mcg,
  });
};

/** User viewed a peptide detail page */
export const trackPeptideView = (peptideName) => {
  trackEvent('peptide_view', {
    event_category: 'Encyclopedia',
    peptide_name: peptideName,
  });
};

/** User searched the encyclopedia */
export const trackSearch = (query, resultsCount) => {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
  });
};

/** User signed up */
export const trackSignUp = (method = 'email') => {
  trackEvent('sign_up', { method });
};

/** User logged in */
export const trackLogin = (method = 'email') => {
  trackEvent('login', { method });
};

/** User logged an injection */
export const trackInjectionLogged = ({ peptide, dose_mcg }) => {
  trackEvent('injection_logged', {
    event_category: 'Log',
    peptide_name: peptide || 'unknown',
    dose_mcg,
  });
};

/** User viewed the price checker */
export const trackPriceCheck = (peptide) => {
  trackEvent('price_check', {
    event_category: 'PriceChecker',
    peptide_name: peptide || 'unknown',
  });
};

/** User clicked an outbound vendor link */
export const trackOutboundLink = (url, vendor) => {
  trackEvent('click', {
    event_category: 'Outbound',
    link_url: url,
    link_text: vendor,
  });
};

/** User shared a page or result */
export const trackShare = (method, content) => {
  trackEvent('share', { method, content_type: content });
};

/** Errors surfaced to the user */
export const trackError = (error) => {
  if (!isRealUser()) return;
  gtag('event', 'exception', {
    description: error?.message || String(error),
    fatal: false,
  });
};

// ---------------------------------------------------------------------------
// Scroll depth — fires once at 25%, 50%, 75%, 90% scroll
// ---------------------------------------------------------------------------
const SCROLL_THRESHOLDS = [25, 50, 75, 90];

function _setupScrollDepth() {
  if (typeof window === 'undefined') return;

  const reached = new Set();
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total <= window.innerHeight) return; // short pages — skip

      const pct = Math.round((scrolled / total) * 100);

      for (const threshold of SCROLL_THRESHOLDS) {
        if (!reached.has(threshold) && pct >= threshold) {
          reached.add(threshold);
          gtag('event', 'scroll', {
            event_category: 'Engagement',
            percent_scrolled: threshold,
            page_path: window.location.pathname,
          });
          if (IS_DEV) console.debug(`[Analytics] scroll ${threshold}% on ${window.location.pathname}`);
        }
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Reset on route change (PageTracker re-mounts on navigation)
  // We listen for popstate/history events to clear the reached set
  const resetScroll = () => {
    reached.clear();
    window.scrollTo(0, 0);
  };
  window.addEventListener('popstate', resetScroll);
}
