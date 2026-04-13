import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback for missing env vars to prevent immediate crash
const isConfigured = supabaseUrl && supabaseAnonKey;

if (!isConfigured) {
    console.error('Supabase is not configured. Missing environment variables.');
}

// Detect if we're running inside a Capacitor native app (iOS/Android).
// On native, OAuth callbacks arrive via deep links, so we disable Supabase's
// automatic URL session detection (which breaks in WKWebView).
// On web browsers (Chrome, Safari, Firefox), we MUST keep detectSessionInUrl: true
// so Supabase can automatically exchange the PKCE ?code= param on the /callback page.
const isNativePlatform = (() => {
    try {
        // Capacitor sets window.Capacitor.isNativePlatform() at runtime
        return typeof window !== 'undefined' &&
            window.Capacitor?.isNativePlatform?.() === true;
    } catch {
        return false;
    }
})();

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            // On native (iOS/Android): deep link handler processes OAuth callbacks,
            // so we disable auto URL detection to avoid conflicts with WKWebView.
            // On web (Chrome/Safari): keep enabled so the /callback page can
            // automatically exchange the PKCE code from the URL query params.
            detectSessionInUrl: !isNativePlatform,
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

