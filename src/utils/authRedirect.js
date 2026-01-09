import { Capacitor } from '@capacitor/core';

/**
 * Get the appropriate redirect URL for authentication
 * Returns app scheme URL on native platforms, web URL on browser
 */
export const getRedirectUrl = (path = '/') => {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
        // Use the app's custom URL scheme for native apps
        // This matches the scheme defined in capacitor.config.ts and iOS Info.plist
        return `net.peptidelog.app://${path.startsWith('/') ? path.slice(1) : path}`;
    }

    // Use web origin for browser
    return `${window.location.origin}${path}`;
};

/**
 * Get the app scheme for deep linking
 */
export const getAppScheme = () => {
    return 'net.peptidelog.app';
};

/**
 * Check if we're running in a native app
 */
export const isNativeApp = () => {
    return Capacitor.isNativePlatform();
};

/**
 * Get all valid redirect URLs for Supabase dashboard configuration
 * Add these URLs to your Supabase Auth settings under "Redirect URLs"
 */
export const getAllRedirectUrls = () => {
    return [
        // Web URLs
        'https://peptidelog.net/**',
        'https://www.peptidelog.net/**',
        'http://localhost:5173/**',
        'http://localhost:3000/**',

        // Native app scheme
        'net.peptidelog.app://**',
        'net.peptidelog.app://callback',
        'net.peptidelog.app://settings',
        'net.peptidelog.app://update-password',
        'net.peptidelog.app://reset-password'
    ];
};
