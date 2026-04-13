import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * AuthCallback — handles OAuth/PKCE redirects from Supabase (Google, etc.)
 *
 * Web flow (Chrome/Safari/Firefox):
 *   - detectSessionInUrl is TRUE, so Supabase's client auto-calls
 *     exchangeCodeForSession when it sees ?code= in the URL.
 *   - We just poll getSession() until it's set, then navigate home.
 *   - We must NOT call exchangeCodeForSession manually — that would
 *     double-consume the single-use code and cause an auth error.
 *
 * Native flow (iOS/Android Capacitor):
 *   - Deep link handler (useDeepLinkHandler) processes the callback.
 *   - This page should never be hit on native, but if it is, we poll.
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('Completing sign in...');
    // Prevent multiple concurrent navigation attempts
    const navigatedRef = useRef(false);

    const goHome = (replace = true) => {
        if (!navigatedRef.current) {
            navigatedRef.current = true;
            navigate('/', { replace });
        }
    };

    const goLogin = (replace = true) => {
        if (!navigatedRef.current) {
            navigatedRef.current = true;
            navigate('/login', { replace });
        }
    };

    useEffect(() => {
        let mounted = true;
        let pollTimer = null;

        const run = async () => {
            // ── Fast path: session already exists ──────────────────────────
            const { data: { session: existing } } = await supabase.auth.getSession();
            if (!mounted) return;
            if (existing?.user) {
                goHome();
                return;
            }

            // ── On web, Supabase auto-processes the ?code= param ───────────
            // detectSessionInUrl:true means the client already started the
            // PKCE exchange in the background. We just wait for it.
            // Do NOT call exchangeCodeForSession here — the code is single-use.

            // ── Poll until session appears or we time out ──────────────────
            const maxWait = 10000; // 10s — generous for slow connections
            const intervalMs = 250;
            let elapsed = 0;

            pollTimer = setInterval(async () => {
                if (!mounted) { clearInterval(pollTimer); return; }
                elapsed += intervalMs;

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user && mounted) {
                        clearInterval(pollTimer);
                        goHome();
                        return;
                    }
                } catch {
                    // Ignore transient errors, keep polling
                }

                if (elapsed >= maxWait && mounted) {
                    clearInterval(pollTimer);
                    console.warn('[AuthCallback] Timed out waiting for session');
                    if (mounted) {
                        setStatus('Sign in timed out. Redirecting...');
                        setTimeout(() => { if (mounted) goLogin(); }, 1200);
                    }
                }
            }, intervalMs);
        };

        // Also listen for Supabase's own auth state event — this fires as
        // soon as detectSessionInUrl finishes the exchange, no polling needed.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
                if (pollTimer) clearInterval(pollTimer);
                goHome();
            }
        });

        run();

        return () => {
            mounted = false;
            if (pollTimer) clearInterval(pollTimer);
            subscription.unsubscribe();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount — no dependency on user/location to avoid re-triggering

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

export default AuthCallback;
