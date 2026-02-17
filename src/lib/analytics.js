// Simple analytics wrapper
// In a real app, this would wrap Google Analytics (gtag) or similar

export const GA_MEASUREMENT_ID = 'G-2V2TNJFR16';

// Detect if the user agent is a bot/crawler
const isBot = () => {
    const botPatterns = [
        /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
        /googlebot/i, /bingbot/i, /yandex/i, /baiduspider/i,
        /facebookexternalhit/i, /twitterbot/i, /rogerbot/i,
        /linkedinbot/i, /embedly/i, /quora link preview/i,
        /showyoubot/i, /outbrain/i, /pinterest/i, /slackbot/i,
        /vkShare/i, /W3C_Validator/i, /whatsapp/i, /applebot/i,
        /headless/i, /phantom/i, /selenium/i, /puppeteer/i,
        /lighthouse/i, /pagespeed/i, /gtmetrix/i
    ];

    const userAgent = navigator.userAgent || '';

    // Check user agent against bot patterns
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
        return true;
    }

    // Additional checks for headless browsers
    if (navigator.webdriver) return true;
    if (!navigator.languages || navigator.languages.length === 0) return true;

    return false;
};

// Check if this is a real user (not a bot)
let isRealUser = null;
const checkRealUser = () => {
    if (isRealUser !== null) return isRealUser;
    isRealUser = !isBot();
    if (!isRealUser) {
        console.log('[Analytics] Bot detected, analytics disabled');
    }
    return isRealUser;
};

export const initAnalytics = () => {
    // Don't init analytics for bots
    if (!checkRealUser()) {
        console.log('[Analytics] Skipping init for bot');
        return;
    }

    console.log('Analytics initialized');

    // Check if script is already added
    if (!document.querySelector(`script[src*="googletagmanager"]`)) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        // Disable automatic page view tracking as we handle it manually in PageTracker
        gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
    }
};

export const trackPageView = (path) => {
    if (!checkRealUser()) return;

    console.log(`[Analytics] Page View: ${path}`);
    if (window.gtag) {
        window.gtag('event', 'page_view', {
            page_path: path
        });
    }
};

export const trackEvent = (category, action, label = null, value = null) => {
    if (!checkRealUser()) return;

    console.log(`[Analytics] Event: ${category} - ${action}`, { label, value });
    if (window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
};

export const trackError = (error) => {
    if (!checkRealUser()) return;

    console.error('[Analytics] Error tracked:', error);
    if (window.gtag) {
        window.gtag('event', 'exception', {
            description: error.message,
            fatal: false
        });
    }
};
