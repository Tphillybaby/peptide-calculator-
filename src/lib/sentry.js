import * as Sentry from '@sentry/react';

// Sentry configuration for error tracking
// To enable: Add VITE_SENTRY_DSN to your environment variables
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export const initSentry = () => {
    if (!SENTRY_DSN) {
        console.log('[Sentry] DSN not configured, error tracking disabled');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: import.meta.env.MODE || 'development',

        // Performance monitoring
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev

        // Session replay for debugging (optional)
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

        // Release tracking
        release: import.meta.env.VITE_APP_VERSION || 'unknown',

        // Filter out noise
        ignoreErrors: [
            // Browser extensions
            'top.GLOBALS',
            'Extensions',
            // Network errors that aren't actionable
            'Failed to fetch',
            'NetworkError',
            'Load failed',
            // User-initiated navigation
            'AbortError',
            // Resize observers (common benign error)
            'ResizeObserver loop',
        ],

        // Don't send PII unless necessary
        beforeSend(event, hint) {
            // Scrub sensitive data
            if (event.request?.headers) {
                delete event.request.headers['Authorization'];
                delete event.request.headers['Cookie'];
            }

            // Don't report errors in development unless explicitly enabled
            if (!import.meta.env.PROD && !import.meta.env.VITE_SENTRY_DEV) {
                console.log('[Sentry] Event captured (dev mode, not sent):', event);
                return null;
            }

            return event;
        },

        // Integration configuration
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                // Mask all text and block all media for privacy
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],
    });

    console.log('[Sentry] Error tracking initialized');
};

// Helper to manually capture errors
export const captureError = (error, context = {}) => {
    if (!SENTRY_DSN) {
        console.error('[Error]', error, context);
        return;
    }

    Sentry.captureException(error, {
        extra: context,
    });
};

// Helper to capture messages
export const captureMessage = (message, level = 'info', context = {}) => {
    if (!SENTRY_DSN) {
        console.log(`[${level}]`, message, context);
        return;
    }

    Sentry.captureMessage(message, {
        level,
        extra: context,
    });
};

// Helper to set user context
export const setUser = (user) => {
    if (!SENTRY_DSN) return;

    if (user) {
        Sentry.setUser({
            id: user.id,
            email: user.email,
            // Don't send full name for privacy
        });
    } else {
        Sentry.setUser(null);
    }
};

// Helper to add breadcrumbs for debugging
export const addBreadcrumb = (message, category = 'app', data = {}) => {
    if (!SENTRY_DSN) return;

    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
    });
};

// Export Sentry for advanced usage
export { Sentry };
