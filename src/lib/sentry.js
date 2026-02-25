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
            /runtime\.sendMessage/,
            /chrome\.runtime/,
            // Network errors that aren't actionable
            'Failed to fetch',
            'NetworkError',
            'Load failed',
            // User-initiated navigation
            'AbortError',
            // Resize observers (common benign error)
            'ResizeObserver loop',
            // Service worker registration failures (Android WebView)
            /ServiceWorkerContainer/,
        ],

        denyUrls: [
            // Browser extensions
            /extensions\//i,
            /^chrome:\/\//i,
            /^chrome-extension:\/\//i,
            /^moz-extension:\/\//i,
        ],

        // Don't send PII unless necessary
        beforeSend(event) {
            try {
                // Filter out unhandled promise rejections from service workers
                // These appear as "Error: Rejected" with mechanism "onunhandledrejection"
                const mechanism = event?.exception?.values?.[0]?.mechanism;
                if (mechanism?.type === 'onunhandledrejection') {
                    const errorValue = event?.exception?.values?.[0]?.value;
                    // Skip service worker registration failures
                    if (errorValue === 'Rejected' || errorValue?.includes?.('ServiceWorker')) {
                        return null;
                    }
                }

                // Scrub sensitive data with defensive checks
                if (event && event.request && event.request.headers) {
                    delete event.request.headers['Authorization'];
                    delete event.request.headers['Cookie'];
                }

                // In development, log the event but still send it if we want to test Sentry
                if (!import.meta.env.PROD) {
                    console.log('[Sentry] Event captured (dev mode):', event);
                    // Uncomment the next line to stop sending in dev if it gets too noisy
                    // if (!import.meta.env.VITE_SENTRY_DEV) return null;
                }

                return event;
            } catch (error) {
                // Log the error but don't let it crash the beforeSend hook
                console.error('[Sentry] Error in beforeSend hook:', error);

                // Return the original event to ensure it still gets sent
                return event;
            }
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

// Attach to window for monitoring service
if (typeof window !== 'undefined') {
    window.Sentry = Sentry;
}

// Export Sentry for advanced usage
export { Sentry };
