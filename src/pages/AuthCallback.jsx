import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('Processing login...');

    useEffect(() => {
        let mounted = true;

        const handleCallback = async () => {
            // If user is already available from AuthContext (fast path), redirect immediately.
            if (user) {
                navigate('/', { replace: true });
                return;
            }

            // On web: detectSessionInUrl is true, so Supabase automatically processes
            // the PKCE ?code= param when the client initialises on this page.
            // We should NOT call exchangeCodeForSession ourselves — that would cause a
            // "code already used" error. Instead, just poll until the session appears.

            // On native: detectSessionInUrl is false, so deep links handle the exchange.
            // The code should never appear in the URL here for native — but as a safety
            // net we attempt a manual exchange if we detect an unused code.
            const isNative = typeof window !== 'undefined' &&
                window.Capacitor?.isNativePlatform?.() === true;

            const params = new URLSearchParams(location.search);
            const hashParams = location.hash ? new URLSearchParams(location.hash.substring(1)) : null;
            const code = params.get('code') || hashParams?.get('code');

            if (code && isNative) {
                // Native-only manual exchange (web lets Supabase handle it automatically)
                try {
                    if (mounted) setStatus('Completing sign in...');
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) {
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session?.user) {
                            if (mounted) navigate('/', { replace: true });
                            return;
                        }
                        console.error('[AuthCallback] Code exchange failed:', error);
                        if (mounted) setStatus('Sign in failed. Redirecting...');
                        setTimeout(() => mounted && navigate('/login', { replace: true }), 1500);
                        return;
                    }
                } catch (e) {
                    console.error('[AuthCallback] Code exchange exception:', e);
                    if (mounted) {
                        setStatus('Sign in failed. Redirecting...');
                        setTimeout(() => navigate('/login', { replace: true }), 1500);
                    }
                    return;
                }
            }

            // Poll for session — Supabase's auto-exchange (web) or deep link handler (native)
            // will set it asynchronously. Poll until it appears or we time out.
            if (mounted) setStatus('Completing sign in...');
            const maxWait = 8000;
            const interval = 300;
            let elapsed = 0;

            const poll = setInterval(() => {
                elapsed += interval;
                if (!mounted) {
                    clearInterval(poll);
                    return;
                }
                supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session?.user && mounted) {
                        clearInterval(poll);
                        navigate('/', { replace: true });
                    } else if (elapsed >= maxWait && mounted) {
                        clearInterval(poll);
                        console.warn('[AuthCallback] Timeout waiting for session');
                        setStatus('Sign in timed out. Redirecting...');
                        setTimeout(() => mounted && navigate('/login', { replace: true }), 1000);
                    }
                });
            }, interval);
        };

        handleCallback();

        return () => { mounted = false; };
    }, [user, navigate, location.search, location.hash]);

    // If user is already set during render, redirect immediately
    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            gap: '1rem',
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
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>{status}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default AuthCallback;
