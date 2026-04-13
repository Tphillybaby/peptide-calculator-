import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * AuthCallback — handles OAuth/PKCE redirects from Supabase (Google, etc.)
 *
 * detectSessionInUrl is FALSE, so Supabase never auto-processes the URL.
 * This component is responsible for:
 *   1. Reading the ?code= from the current URL
 *   2. Calling exchangeCodeForSession(code) explicitly
 *   3. Navigating home on success, or back to login on failure
 *
 * Why manual exchange instead of detectSessionInUrl:true?
 *   - Gives full control over errors (no silent timeout)
 *   - Avoids race conditions where the auto-exchange fires before
 *     our onAuthStateChange listener is registered
 *   - Works reliably in all browsers without depending on Supabase internals
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Completing sign in...');
    const navigatedRef = useRef(false);

    const goHome = () => {
        if (!navigatedRef.current) {
            navigatedRef.current = true;
            navigate('/', { replace: true });
        }
    };

    const goLogin = () => {
        if (!navigatedRef.current) {
            navigatedRef.current = true;
            navigate('/login', { replace: true });
        }
    };

    useEffect(() => {
        let mounted = true;

        const run = async () => {
            // ── Fast path: already have a valid session ────────────────────
            // (e.g. user refreshed the page after logging in)
            const { data: { session: existing } } = await supabase.auth.getSession();
            if (!mounted) return;
            if (existing?.user) {
                goHome();
                return;
            }

            // ── Read the ?code= from the current URL ───────────────────────
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (!code) {
                // No code in URL — check for hash-based implicit flow tokens
                const hash = window.location.hash;
                if (hash && hash.includes('access_token')) {
                    // Implicit flow: Supabase handles hash tokens automatically
                    // via onAuthStateChange even with detectSessionInUrl:false
                    // Just poll briefly for the session
                    await waitForSession(mounted, setStatus, goHome, goLogin);
                    return;
                }

                console.error('[AuthCallback] No code or token in URL');
                if (mounted) {
                    setStatus('No login code found. Redirecting...');
                    setTimeout(goLogin, 1500);
                }
                return;
            }

            // ── Exchange the PKCE code for a session ───────────────────────
            if (mounted) setStatus('Completing sign in...');

            try {
                const { data, error } = await supabase.auth.exchangeCodeForSession(code);

                if (!mounted) return;

                if (error) {
                    console.error('[AuthCallback] Code exchange failed:', error.message);

                    // Check if maybe it was already exchanged (double-load race)
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        goHome();
                        return;
                    }

                    setStatus(`Sign in failed: ${error.message}`);
                    setTimeout(goLogin, 2000);
                    return;
                }

                if (data?.session?.user) {
                    goHome();
                } else {
                    // Exchange succeeded but session not immediately available —
                    // onAuthStateChange should fire shortly
                    await waitForSession(mounted, setStatus, goHome, goLogin);
                }
            } catch (e) {
                if (!mounted) return;
                console.error('[AuthCallback] Exchange exception:', e);
                setStatus('Sign in failed. Redirecting...');
                setTimeout(goLogin, 1500);
            }
        };

        run();

        return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount only

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '1rem',
            background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                border: '3px solid rgba(59, 130, 246, 0.2)',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>{status}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

/**
 * Poll getSession() for up to 6 seconds, navigating home when it appears.
 * Used as a fallback after exchangeCodeForSession or for implicit flow.
 */
async function waitForSession(mounted, setStatus, goHome, goLogin) {
    const maxWait = 6000;
    const intervalMs = 300;
    let elapsed = 0;

    await new Promise((resolve) => {
        const timer = setInterval(async () => {
            if (!mounted) { clearInterval(timer); resolve(); return; }
            elapsed += intervalMs;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    clearInterval(timer);
                    goHome();
                    resolve();
                    return;
                }
            } catch { /* keep polling */ }

            if (elapsed >= maxWait) {
                clearInterval(timer);
                console.warn('[AuthCallback] Timed out waiting for session');
                if (mounted) {
                    setStatus('Sign in timed out. Redirecting...');
                    setTimeout(goLogin, 1000);
                }
                resolve();
            }
        }, intervalMs);
    });
}

export default AuthCallback;
