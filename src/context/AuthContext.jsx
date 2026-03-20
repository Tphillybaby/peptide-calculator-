import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getRedirectUrl } from '../utils/authRedirect';

const AuthContext = createContext({});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    // Use refs to track state without triggering effect re-runs
    const loadingRef = useRef(loading);
    const userRef = useRef(user);

    useEffect(() => {
        loadingRef.current = loading;
        userRef.current = user;
    }, [loading, user]);

    useEffect(() => {
        let mounted = true;

        // Failsafe: Force app to load after 3 seconds even if auth is slow
        const safetyTimeout = setTimeout(() => {
            if (mounted && loadingRef.current) {
                console.warn('Auth check timed out, forcing app load');
                setLoading(false);
            }
        }, 3000);

        // Fetch additional user details (Admin/Premium) without blocking the UI
        const fetchUserDetails = async (userId) => {
            try {
                // Fetch independently to avoid one failing the other
                const profilePromise = supabase.from('profiles').select('is_admin').eq('id', userId).single();
                const subPromise = supabase.from('user_subscriptions').select('plan, status, current_period_end').eq('user_id', userId).single();

                // Update last_sign_in timestamp on every auth check
                const updateSignInPromise = supabase
                    .from('profiles')
                    .update({ last_sign_in: new Date().toISOString() })
                    .eq('id', userId);

                const [profileResult, subResult] = await Promise.all([
                    profilePromise,
                    subPromise,
                    updateSignInPromise
                ]);

                if (!mounted) return;

                const adminStatus = profileResult.data?.is_admin || false;
                setIsAdmin(adminStatus);

                // Determine premium status
                let premiumStatus = adminStatus;
                if (!premiumStatus && subResult.data && subResult.data.status === 'active') {
                    if (['premium', 'pro'].includes(subResult.data.plan)) {
                        const endDate = subResult.data.current_period_end;
                        if (!endDate || new Date(endDate) > new Date()) {
                            premiumStatus = true;
                        }
                    }
                }
                setIsPremium(premiumStatus);
            } catch (error) {
                console.error('Background user details fetch failed:', error);
            }
        };

        // Initialize session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                if (session?.user) {
                    setUser(session.user);
                    // Start fetching extra data in background
                    fetchUserDetails(session.user.id);
                }
                // Don't wait for extra data to render the app
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                if (session?.user) {
                    setUser(session.user);
                    // Re-fetch details on change (e.g. login/signup)
                    // We only re-fetch if the user ID changed to avoid redundant calls
                    if (userRef.current?.id !== session.user.id) {
                        fetchUserDetails(session.user.id);
                    }
                } else {
                    setUser(null);
                    setIsAdmin(false);
                    setIsPremium(false);
                }
                setLoading(false);
            }
        });

        // Real-time subscription updates - unlocks features instantly after payment
        let subscriptionChannel = null;
        const setupRealtimeSubscription = (userId) => {
            if (subscriptionChannel) {
                supabase.removeChannel(subscriptionChannel);
            }

            subscriptionChannel = supabase
                .channel('subscription-updates')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'user_subscriptions',
                        filter: `user_id=eq.${userId}`
                    },
                    (payload) => {
                        const newData = payload.new;
                        if (newData && newData.status === 'active' && ['premium', 'pro'].includes(newData.plan)) {
                            const endDate = newData.current_period_end;
                            if (!endDate || new Date(endDate) > new Date()) {
                                setIsPremium(true);
                            }
                        } else if (newData && newData.status !== 'active') {
                            setIsPremium(false);
                        }
                    }
                )
                .subscribe();
        };

        // Setup realtime when user is available
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user && mounted) {
                setupRealtimeSubscription(session.user.id);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
            if (subscriptionChannel) {
                supabase.removeChannel(subscriptionChannel);
            }
        };
    }, []);

    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        if (error) throw error;
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const resetPassword = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: getRedirectUrl('/update-password'),
        });
        if (error) throw error;
    };

    const updatePassword = async (newPassword) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
    };

    const urlListenerRef = useRef(null);

    const signInWithOAuth = async (provider) => {
        const { isNativeApp } = await import('../utils/authRedirect');

        if (isNativeApp()) {
            // Clean up any existing listener
            if (urlListenerRef.current) {
                console.log('[OAuth] Cleaning up previous listener');
                urlListenerRef.current.remove();
                urlListenerRef.current = null;
            }

            // On native platforms, we use an in-app browser flow
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: getRedirectUrl('/callback'),
                    skipBrowserRedirect: true 
                }
            });

            if (error) throw error;

            if (data?.url) {
                const { Browser } = await import('@capacitor/browser');
                const { App } = await import('@capacitor/app');

                // Listen for the app to reopen with the auth callback
                urlListenerRef.current = await App.addListener('appUrlOpen', async (event) => {
                    console.log('[OAuth] Deep link received:', event.url);

                    try {
                        // Close the browser - wrap in try/catch as it may already be closed
                        try {
                            await Browser.close();
                        } catch (e) {
                            console.warn('[OAuth] Browser close error:', e);
                        }

                        // Extract tokens/codes from the callback URL
                        const url = new URL(event.url);
                        // Access hash fragment and search params
                        const hashParams = url.hash ? new URLSearchParams(url.hash.substring(1)) : null;
                        const queryParams = url.searchParams;
                        
                        const accessToken = hashParams?.get('access_token');
                        const refreshToken = hashParams?.get('refresh_token');
                        const code = queryParams.get('code') || hashParams?.get('code');

                        if (accessToken && refreshToken) {
                            console.log('[OAuth] Session set from tokens');
                            const { error: sessionError } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken
                            });
                            if (sessionError) console.error('[OAuth] Session error:', sessionError);
                        } else if (code) {
                            console.log('[OAuth] Exchanging code for session');
                            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                            if (exchangeError) {
                                // If code was already exchanged by global listener, session might exist
                                const { data: { session } } = await supabase.auth.getSession();
                                if (!session) console.error('[OAuth] Exchange error:', exchangeError);
                            }
                        }
                    } catch (e) {
                        console.error('[OAuth] Callback processing error:', e);
                    } finally {
                        if (urlListenerRef.current) {
                            urlListenerRef.current.remove();
                            urlListenerRef.current = null;
                        }
                    }
                });

                // Open the OAuth URL
                await Browser.open({
                    url: data.url,
                    windowName: '_self',
                    presentationStyle: 'popover'
                });
            }

            return data;
        } else {
            // Web platform behavior
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: getRedirectUrl('/callback'),
                    // For Google, select_account can help users who have several gmail accounts
                    queryParams: provider === 'google' ? { prompt: 'select_account' } : {}
                }
            });
            if (error) throw error;
            return data;
        }
    };

    const mockLogin = () => {
        // Only allow mock login in development mode for security
        if (import.meta.env.PROD) {
            console.warn('Mock login is disabled in production');
            return;
        }
        setUser({
            id: 'mock-user-id',
            email: 'demo@example.com',
            user_metadata: { full_name: 'Demo User' }
        });
        setLoading(false);
    };

    const value = {
        user,
        isAdmin,
        isPremium,
        loading,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        resetPassword,
        updatePassword,
        mockLogin
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)',
                    color: '#f8fafc',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '3px solid rgba(59, 130, 246, 0.2)',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ color: '#94a3b8' }}>Loading...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
