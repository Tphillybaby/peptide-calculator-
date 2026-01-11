import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getRedirectUrl } from '../utils/authRedirect';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const checkUser = async (retryCount = 0) => {
            try {
                // Simple session check without aggressive timeout
                // Supabase has its own internal timeout handling
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                // If there's a transient error and we haven't retried yet, try once more
                if (sessionError && retryCount < 1) {
                    console.warn('Session check failed, retrying...', sessionError);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return checkUser(retryCount + 1);
                }

                if (session?.user) {
                    const currentUser = session.user;
                    if (mounted) setUser(currentUser);

                    // Fetch profile (admin status) and subscription in parallel
                    // Use a gentler timeout approach
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 8000);

                        const [profileResult, subResult] = await Promise.all([
                            supabase.from('profiles').select('is_admin').eq('id', currentUser.id).single(),
                            supabase.from('user_subscriptions').select('plan, status, current_period_end').eq('user_id', currentUser.id).single()
                        ]);

                        clearTimeout(timeoutId);

                        if (mounted) {
                            const adminStatus = profileResult.data?.is_admin || false;
                            setIsAdmin(adminStatus);

                            // Determine premium status: Admin OR Active Subscription
                            let premiumStatus = adminStatus;

                            if (!premiumStatus && subResult.data && subResult.data.status === 'active') {
                                // Check valid plans
                                if (['premium', 'pro'].includes(subResult.data.plan)) {
                                    const endDate = subResult.data.current_period_end;
                                    if (!endDate || new Date(endDate) > new Date()) {
                                        premiumStatus = true;
                                    }
                                }
                            }

                            setIsPremium(premiumStatus);
                        }
                    } catch (profileErr) {
                        console.warn('Profile fetch failed:', profileErr.message);
                        // Continue without admin/premium status - user can still use the app
                    }
                } else {
                    if (mounted) {
                        setUser(null);
                        setIsAdmin(false);
                        setIsPremium(false);
                    }
                }
            } catch (err) {
                // Handle AbortError and other transient errors gracefully
                if (err.name === 'AbortError') {
                    console.warn('Auth check was aborted (likely a timeout or navigation issue)');
                } else {
                    console.error('Auth check failed:', err.message || err);
                }
                if (mounted) {
                    setUser(null);
                    setIsAdmin(false);
                    setIsPremium(false);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        checkUser();


        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setUser(session.user);
                // Re-run checks if user changes (simplified here, but ideally we'd refactor the check logic to be reusable)
                // For now, we reuse the robust initial check, but onAuthStateChange might fire frequently.
                // Let's just do a quick re-check or duplicate the logic for responsiveness.
                // To keep it clean, we'll let the user navigate and components might re-trigger if needed, 
                // but for critical state, we should probably fetch.

                // For this implementation, we will trust the session user, but we might lag on isPremium/isAdmin update 
                // if we don't fetch. So let's fetch again.
                const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
                const { data: sub } = await supabase.from('user_subscriptions').select('plan, status').eq('user_id', session.user.id).single();

                const admin = profile?.is_admin || false;
                setIsAdmin(admin);

                let prem = admin;
                if (!prem && sub?.status === 'active' && ['premium', 'pro'].includes(sub.plan)) {
                    prem = true;
                }
                setIsPremium(prem);

            } else {
                setUser(null);
                setIsAdmin(false);
                setIsPremium(false);
            }
            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
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
