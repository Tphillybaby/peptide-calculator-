/**
 * Deep Link Handler for Authentication
 * Handles OAuth callbacks and magic links when app opens via custom URL scheme
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';

/**
 * Parse the deep link URL and extract route and params
 */
const parseDeepLink = (url) => {
    try {
        // URL format: net.peptidelog.app://path?params
        // or: net.peptidelog.app://callback#access_token=...
        const urlObj = new URL(url);

        // Get the path (after the scheme://)
        let path = urlObj.pathname || urlObj.hostname || '/';
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Check for hash params (OAuth tokens come in hash)
        const hashParams = urlObj.hash ? new URLSearchParams(urlObj.hash.substring(1)) : null;
        const queryParams = new URLSearchParams(urlObj.search);

        return {
            path,
            hashParams,
            queryParams,
            fullUrl: url
        };
    } catch (e) {
        console.error('[DeepLink] Failed to parse URL:', e);
        return null;
    }
};

/**
 * Handle authentication tokens from deep links
 */
const handleAuthDeepLink = async (parsedUrl) => {
    if (!parsedUrl?.hashParams) return false;

    const accessToken = parsedUrl.hashParams.get('access_token');
    const refreshToken = parsedUrl.hashParams.get('refresh_token');
    const type = parsedUrl.hashParams.get('type');

    if (accessToken && refreshToken) {
        try {
            // Set the session from the tokens
            const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });

            if (error) {
                console.error('[DeepLink] Failed to set session:', error);
                return false;
            }

            return true;
        } catch (e) {
            console.error('[DeepLink] Auth error:', e);
            return false;
        }
    }

    return false;
};

/**
 * Hook to handle deep links when app opens
 * Should be used in the root App component
 */
export const useDeepLinkHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const setupDeepLinkListener = async () => {
            try {
                const { App } = await import('@capacitor/app');

                // Handle URL when app is opened via deep link
                App.addListener('appUrlOpen', async (event) => {

                    const parsed = parseDeepLink(event.url);
                    if (!parsed) return;

                    // Handle auth callbacks
                    const wasAuth = await handleAuthDeepLink(parsed);

                    if (wasAuth) {
                        // Navigate to the intended destination after auth
                        const destination = parsed.path === '/callback' ? '/dashboard' : parsed.path;
                        navigate(destination, { replace: true });
                    } else if (parsed.path && parsed.path !== '/') {
                        // Navigate to the path
                        navigate(parsed.path, { replace: true });
                    }
                });

                // Check if app was launched with a URL (cold start)
                const launchUrl = await App.getLaunchUrl();
                if (launchUrl?.url) {

                    const parsed = parseDeepLink(launchUrl.url);
                    if (parsed) {
                        const wasAuth = await handleAuthDeepLink(parsed);
                        if (wasAuth) {
                            const destination = parsed.path === '/callback' ? '/dashboard' : parsed.path;
                            navigate(destination, { replace: true });
                        }
                    }
                }
            } catch (e) {
                console.error('[DeepLink] Failed to setup listener:', e);
            }
        };

        setupDeepLinkListener();
    }, [navigate]);
};

/**
 * Initialize deep link handling (call in App initialization)
 */
export const initDeepLinks = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        const { App } = await import('@capacitor/app');

        // Check for launch URL
        const launchUrl = await App.getLaunchUrl();
        if (launchUrl?.url) {
            const parsed = parseDeepLink(launchUrl.url);
            if (parsed) {
                await handleAuthDeepLink(parsed);
            }
        }
    } catch (e) {
        console.error('[DeepLink] Init error:', e);
    }
};

export default useDeepLinkHandler;
