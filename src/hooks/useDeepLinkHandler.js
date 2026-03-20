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
    if (!parsedUrl) return false;

    // Case 1: Tokens in the hash fragment (Implicit flow)
    if (parsedUrl.hashParams) {
        const accessToken = parsedUrl.hashParams.get('access_token');
        const refreshToken = parsedUrl.hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
            try {
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });

                if (error) {
                    console.error('[DeepLink] Failed to set session from tokens:', error);
                    return false;
                }

                console.log('[DeepLink] Session set successfully from tokens');
                return true;
            } catch (e) {
                console.error('[DeepLink] Auth error with tokens:', e);
                return false;
            }
        }
    }

    // Case 2: Code in query params or hash (PKCE flow)
    const code = parsedUrl.queryParams?.get('code') || parsedUrl.hashParams?.get('code');
    if (code) {
        try {
            console.log('[DeepLink] Exchanging code for session');
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
                // If the code was already exchanged by another listener, this might fail
                // We check if we have a session already
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    console.log('[DeepLink] Code already exchanged, session exists');
                    return true;
                }
                console.error('[DeepLink] Failed to exchange code:', error);
                return false;
            }
            console.log('[DeepLink] Code exchanged successfully');
            return true;
        } catch (e) {
            console.error('[DeepLink] Error during code exchange:', e);
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
                    console.log('[DeepLink] App opened via URL:', event.url);

                    const parsed = parseDeepLink(event.url);
                    if (!parsed) return;

                    // Handle auth callbacks
                    const wasAuth = await handleAuthDeepLink(parsed);

                    if (wasAuth) {
                        // Navigate to the intended destination after auth
                        const destination = parsed.path === '/callback' ? '/' : parsed.path;
                        navigate(destination, { replace: true });
                    } else if (parsed.path && parsed.path !== '/') {
                        // Construct the full path with parameters to avoid losing them
                        const queryStr = parsed.queryParams?.toString();
                        const hashStr = parsed.hashParams?.toString();
                        const fullPath = `${parsed.path}${queryStr ? '?' + queryStr : ''}${hashStr ? '#' + hashStr : ''}`;
                        
                        console.log('[DeepLink] Navigating to:', fullPath);
                        navigate(fullPath, { replace: true });
                    }
                });

                // Check if app was launched with a URL (cold start)
                const launchUrl = await App.getLaunchUrl();
                if (launchUrl?.url) {
                    console.log('[DeepLink] App launched with URL:', launchUrl.url);

                    const parsed = parseDeepLink(launchUrl.url);
                    if (parsed) {
                        const wasAuth = await handleAuthDeepLink(parsed);
                        if (wasAuth) {
                            const destination = parsed.path === '/callback' ? '/' : parsed.path;
                            navigate(destination, { replace: true });
                        } else if (parsed.path && parsed.path !== '/') {
                            const queryStr = parsed.queryParams?.toString();
                            const hashStr = parsed.hashParams?.toString();
                            const fullPath = `${parsed.path}${queryStr ? '?' + queryStr : ''}${hashStr ? '#' + hashStr : ''}`;
                            navigate(fullPath, { replace: true });
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
