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

                const [profileResult, subResult] = await Promise.all([profilePromise, subPromise]);

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

        // Listen for changes
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

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
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

    const signInWithOAuth = async (provider) => {
        const { isNativeApp } = await import('../utils/authRedirect');

        if (isNativeApp()) {
            // On native platforms, we need to use a different flow
            // Get the OAuth URL and open it in an in-app browser
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: getRedirectUrl('/callback'),
                    skipBrowserRedirect: true // Don't auto-redirect, we'll handle it
                }
            });

            if (error) throw error;

            if (data?.url) {
                // Open OAuth URL in in-app browser
                const { Browser } = await import('@capacitor/browser');

                // Listen for the app to reopen with the auth callback
                const { App } = await import('@capacitor/app');

                const urlListener = App.addListener('appUrlOpen', async (event) => {
                    // Close the browser
                    await Browser.close();

                    // Parse the callback URL for tokens
                    if (event.url.includes('access_token') || event.url.includes('code')) {
                        // The deep link handler will process this
                        console.log('[OAuth] Callback received:', event.url);
                    }

                    // Remove listener
                    urlListener.remove();
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
            // Web platform - use normal OAuth flow
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: getRedirectUrl('/settings')
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
