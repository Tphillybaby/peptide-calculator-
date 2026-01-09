import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const currentUser = session.user;
                    setUser(currentUser);

                    // Fetch profile (admin status) and subscription in parallel
                    const [profileResult, subResult] = await Promise.all([
                        supabase.from('profiles').select('is_admin').eq('id', currentUser.id).single(),
                        supabase.from('user_subscriptions').select('plan, status, current_period_end').eq('user_id', currentUser.id).single()
                    ]);

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
                } else {
                    setUser(null);
                    setIsAdmin(false);
                    setIsPremium(false);
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                setUser(null);
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
            redirectTo: `${window.location.origin}/update-password`,
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
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/settings`
            }
        });
        if (error) throw error;
        return data;
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
            {!loading && children}
        </AuthContext.Provider>
    );
};
