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
            // Case 1: PKCE flow — mobile browsers often use this
            // The URL will have ?code=... as a query parameter or #code=... in hash
            const params = new URLSearchParams(location.search);
            const hashParams = location.hash ? new URLSearchParams(location.hash.substring(1)) : null;
            const code = params.get('code') || hashParams?.get('code');

            if (code) {
                try {
                    if (mounted) setStatus('Completing sign in...');
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) {
                        // If the session was already exchanged by a listener elsewhere,
                        // check if we have a session before giving up
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
                    // Session is now set — onAuthStateChange will update user
                    // Fall through to the polling below
                } catch (e) {
                    console.error('[AuthCallback] Code exchange exception:', e);
                    if (mounted) {
                        setStatus('Sign in failed. Redirecting...');
                        setTimeout(() => navigate('/login', { replace: true }), 1500);
                    }
                    return;
                }
            }

            // Case 2: Implicit flow — URL has #access_token=...
            // Supabase client automatically detects and processes hash fragments
            // via onAuthStateChange. We just need to wait for user to appear.

            // Case 3: User already authenticated (e.g., fast session restore)
            if (user) {
                navigate('/', { replace: true });
                return;
            }

            // Poll for the user to be set (by onAuthStateChange in AuthContext)
            // Use a longer timeout for mobile (8 seconds)
            const maxWait = 8000;
            const interval = 300;
            let elapsed = 0;

            const poll = setInterval(() => {
                elapsed += interval;
                if (!mounted) {
                    clearInterval(poll);
                    return;
                }
                // Check if supabase has a session now
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
