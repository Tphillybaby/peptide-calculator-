/**
 * Service Worker Registration with Error Handling
 *
 * This replaces VitePWA's auto-injected registration script
 * to properly catch and handle registration errors.
 */

export const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
        console.log('[SW] Service workers not supported');
        return;
    }

    // Only register in production
    if (import.meta.env.DEV) {
        console.log('[SW] Skipping registration in development');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });

        console.log('[SW] Service worker registered successfully:', registration.scope);

        // Handle updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content available, you could show a refresh prompt here
                        console.log('[SW] New content available, refresh to update');
                    }
                });
            }
        });

        // Check for updates periodically (every hour)
        setInterval(() => {
            registration.update().catch((err) => {
                console.warn('[SW] Update check failed:', err);
            });
        }, 60 * 60 * 1000);

    } catch (error) {
        // Gracefully handle registration failures
        console.warn('[SW] Service worker registration failed:', error.message || error);

        // Don't report to Sentry for common/expected failures
        if (error.name === 'SecurityError') {
            console.log('[SW] Registration blocked by security policy (expected in some contexts)');
        } else if (error.message?.includes('404')) {
            console.log('[SW] Service worker file not found (may not be built yet)');
        }
        // For other errors, we just log them - no need to crash the app
    }
};

// Auto-register on window load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        registerServiceWorker();
    });
}
