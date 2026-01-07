import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature')

    // Create a Supabase client with the SERVICE ROLE key to bypass RLS
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
        const body = await req.text() // Raw body

        // Verify the event came from Stripe
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature!,
            Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '',
            undefined,
            cryptoProvider
        )

        console.log(`🔔 Event received: ${event.type}`);

        // Handle the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.user_id;

            if (userId) {
                console.log(`✅ Payment success for user: ${userId}`);

                // Retrieve full subscription details to get start/end dates
                const subscription = await stripe.subscriptions.retrieve(session.subscription);

                // Upsert into user_subscriptions table
                await supabase.from('user_subscriptions').upsert({
                    user_id: userId,
                    stripe_subscription_id: subscription.id,
                    stripe_customer_id: session.customer,
                    plan: 'premium', // Default to premium for now, could parse session line items
                    status: subscription.status,
                    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                });

                // Also update profile status
                await supabase.from('profiles').update({
                    subscription_tier: 'premium',
                    subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString()
                }).eq('id', userId);
            }
        }

        if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object;

            // Find user by stripe_customer_id
            const { data: profile } = await supabase.from('profiles')
                .select('id')
                .eq('stripe_customer_id', subscription.customer)
                .single();

            if (profile) {
                console.log(`🔄 Subscription updated for user: ${profile.id}`);

                await supabase.from('user_subscriptions').upsert({
                    user_id: profile.id,
                    stripe_subscription_id: subscription.id,
                    status: subscription.status,
                    plan: 'premium', // Keep simplified for now
                    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                });

                // Update profile
                await supabase.from('profiles').update({
                    subscription_tier: subscription.status === 'active' ? 'premium' : 'free',
                    subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString()
                }).eq('id', profile.id);
            }
        }

        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            // Downgrade user
            const { data: profile } = await supabase.from('profiles')
                .select('id')
                .eq('stripe_customer_id', subscription.customer)
                .single();

            if (profile) {
                console.log(`❌ Subscription deleted for user: ${profile.id}`);
                await supabase.from('user_subscriptions').update({
                    status: 'canceled'
                }).eq('stripe_subscription_id', subscription.id);

                await supabase.from('profiles').update({
                    subscription_tier: 'free'
                }).eq('id', profile.id);
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})
