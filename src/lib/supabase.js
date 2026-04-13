import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback for missing env vars to prevent immediate crash
const isConfigured = supabaseUrl && supabaseAnonKey;

if (!isConfigured) {
    console.error('Supabase is not configured. Missing environment variables.');
}

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            // detectSessionInUrl is false everywhere.
            // On web: AuthCallback.jsx manually calls exchangeCodeForSession
            //   so we have full control and can show proper errors.
            // On native: useDeepLinkHandler processes OAuth callbacks via
            //   the Capacitor deep link event — URL auto-detection would
            //   break in WKWebView.
            detectSessionInUrl: false,
            flowType: 'pkce',
            autoRefreshToken: true,
            persistSession: true,
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        }
    })
    : (() => {
        // Mock client that returns errors but doesn't crash app
        // Supports method chaining for database queries
        const createMockBuilder = () => {
            const builder = {
                select: () => builder,
                insert: () => builder,
                update: () => builder,
                delete: () => builder,
                eq: () => builder,
                neq: () => builder,
                gt: () => builder,
                lt: () => builder,
                gte: () => builder,
                lte: () => builder,
                order: () => builder,
                limit: () => builder,
                single: () => builder,
                maybeSingle: () => builder,
                // The 'then' method makes this thenable, so it can be awaited
                then: (resolve) => {
                    resolve({ data: [], error: { message: 'Supabase not configured' } });
                }
            };
            return builder;
        };

        return {
            auth: {
                getSession: async () => ({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                signUp: async () => ({ error: { message: 'Supabase not configured' } }),
                signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
                signOut: async () => ({ error: null }),
                resetPasswordForEmail: async () => ({ error: { message: 'Supabase not configured' } }),
                updateUser: async () => ({ error: { message: 'Supabase not configured' } }),
                signInWithOAuth: async () => ({ error: { message: 'Supabase not configured' } }),
            },
            from: () => createMockBuilder()
        };
    })();

