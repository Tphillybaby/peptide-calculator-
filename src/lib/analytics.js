// Simple analytics wrapper
// In a real app, this would wrap Google Analytics (gtag) or similar

const GA_MEASUREMENT_ID = 'G-2V2TNJFR16';

export const initAnalytics = () => {
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
        gtag('config', GA_MEASUREMENT_ID);
    }
};

export const trackPageView = (path) => {
    console.log(`[Analytics] Page View: ${path}`);
    if (window.gtag) {
        window.gtag('event', 'page_view', {
            page_path: path
        });
    }
};

export const trackEvent = (category, action, label = null, value = null) => {
    console.log(`[Analytics] Event: ${category} - ${action}`, { label, value });
    if (window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
};

export const trackError = (error, errorInfo) => {
    console.error('[Analytics] Error tracked:', error);
    if (window.gtag) {
        window.gtag('event', 'exception', {
            description: error.message,
            fatal: false
        });
    }
};
