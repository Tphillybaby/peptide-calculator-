/**
 * Payment Service
 * 
 * Foundation for future Stripe integration.
 * Currently provides placeholder/mock functionality.
 * 
 * To enable real payments:
 * 1. Create a Stripe account at stripe.com
 * 2. Add STRIPE_PUBLISHABLE_KEY to .env
 * 3. Create Supabase Edge Function for server-side Stripe operations
 * 4. Uncomment and update the real implementation below
 */

import { supabase } from '../lib/supabase';

// Premium feature tiers (for future use)
export const SUBSCRIPTION_TIERS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
            'Basic injection tracking',
            'Reconstitution calculator',
            'Peptide encyclopedia access',
            'Community reviews (read only)'
        ],
        limits: {
            injections: 50,
            schedules: 5,
            savedCalculations: 10
        }
    },
    PREMIUM: {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        priceId: 'price_1SmsqkIsqdbNeRDSszArcnnx',
        features: [
            'Unlimited injection tracking',
            'Advanced analytics & charts',
            'Export data to CSV/PDF',
            'Priority support',
            'Custom reminders',
            'Write community reviews'
        ],
        limits: {
            injections: Infinity,
            schedules: Infinity,
            savedCalculations: Infinity
        }
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        price: 19.99,
        priceId: 'price_1SmsrjIsqdbNeRDShyC0mdgf',
        features: [
            'Everything in Premium',
            'API access',
            'Multiple profiles',
            'White-label reports',
            'Dedicated support'
        ],
        limits: {
            injections: Infinity,
            schedules: Infinity,
            savedCalculations: Infinity,
            profiles: 5
        }
    }
};

export const paymentService = {
    /**
     * Check if user has an active subscription
     */
    async getSubscriptionStatus(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('subscription_tier, subscription_expires_at')
                .eq('id', userId)
                .single();

            if (error) throw error;

            const isActive = data.subscription_expires_at
                ? new Date(data.subscription_expires_at) > new Date()
                : false;

            return {
                success: true,
                tier: data.subscription_tier || 'free',
                isActive: data.subscription_tier === 'free' || isActive,
                expiresAt: data.subscription_expires_at
            };
        } catch (error) {
            console.error('[Payment Service] Get subscription failed:', error);
            return { success: false, tier: 'free', isActive: true };
        }
    },

    /**
     * Get tier details
     */
    getTierDetails(tierId) {
        return SUBSCRIPTION_TIERS[tierId.toUpperCase()] || SUBSCRIPTION_TIERS.FREE;
    },

    /**
     * Check if user can access a feature based on their tier
     */
    async canAccessFeature(userId, featureName) {
        const { tier } = await this.getSubscriptionStatus(userId);
        const tierDetails = this.getTierDetails(tier);

        // Map feature names to tier requirements
        const premiumFeatures = [
            'unlimited_injections',
            'advanced_analytics',
            'data_export',
            'priority_support',
            'custom_reminders',
            'write_reviews'
        ];

        const proFeatures = [
            'api_access',
            'multiple_profiles',
            'white_label'
        ];

        if (proFeatures.includes(featureName)) {
            return tier === 'pro';
        }

        if (premiumFeatures.includes(featureName)) {
            return tier === 'premium' || tier === 'pro';
        }

        return true; // Free features
    },

    /**
     * Create checkout session
     * Calls Supabase Edge Function to initiate Stripe Checkout
     */
    async createCheckoutSession(userId, tierId) {
        try {
            const priceId = this.getTierDetails(tierId).priceId;
            const returnUrl = window.location.origin + '/settings'; // Return to settings page

            const { data, error } = await supabase.functions.invoke('create-checkout', {
                body: {
                    priceId,
                    returnUrl
                }
            });

            if (error) throw error;

            if (data?.url) {
                // Redirect user to Stripe Checkout
                window.location.href = data.url;
                return { success: true, redirecting: true };
            } else {
                throw new Error('No checkout URL returned');
            }

        } catch (error) {
            console.error('[Payment Service] Checkout failed:', error);
            return {
                success: false,
                message: 'Failed to start checkout. Please try again or contact support.'
            };
        }
    },

    /**
     * Manage subscription (cancel, upgrade, etc.)
     * Links to Stripe Customer Portal (future implementation)
     */
    async manageSubscription(userId) {
        // Ideally this also calls a backend function to get a portal link
        alert('Subscription management portal coming soon. Please contact support to modify your plan.');

        return {
            success: false,
            message: 'Subscription management coming soon!'
        };
    },

    /**
     * Grant beta/promo access to premium features
     */
    async grantBetaAccess(userId, durationDays = 30) {
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);

            const { error } = await supabase
                .from('profiles')
                .update({
                    subscription_tier: 'premium',
                    subscription_expires_at: expiresAt.toISOString()
                })
                .eq('id', userId);

            if (error) throw error;

            return {
                success: true,
                message: `Premium access granted for ${durationDays} days!`,
                expiresAt
            };
        } catch (error) {
            console.error('[Payment Service] Grant beta access failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Check usage against tier limits
     */
    async checkUsageLimits(userId) {
        try {
            const { tier } = await this.getSubscriptionStatus(userId);
            const tierDetails = this.getTierDetails(tier);

            // Get current usage counts
            const [injections, schedules, savedCalcs] = await Promise.all([
                supabase.from('injections').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('schedules').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('user_calculations').select('*', { count: 'exact', head: true }).eq('user_id', userId)
            ]);

            return {
                success: true,
                tier,
                usage: {
                    injections: {
                        used: injections.count || 0,
                        limit: tierDetails.limits.injections,
                        remaining: tierDetails.limits.injections - (injections.count || 0)
                    },
                    schedules: {
                        used: schedules.count || 0,
                        limit: tierDetails.limits.schedules,
                        remaining: tierDetails.limits.schedules - (schedules.count || 0)
                    },
                    savedCalculations: {
                        used: savedCalcs.count || 0,
                        limit: tierDetails.limits.savedCalculations,
                        remaining: tierDetails.limits.savedCalculations - (savedCalcs.count || 0)
                    }
                }
            };
        } catch (error) {
            console.error('[Payment Service] Check usage failed:', error);
            return { success: false };
        }
    }
};
