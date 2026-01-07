import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Get the user from the authorization header
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        const { priceId, returnUrl } = await req.json()

        // Get or create customer in Stripe
        let customerId;
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('stripe_customer_id, email')
            .eq('id', user.id)
            .single()

        if (profile?.stripe_customer_id) {
            customerId = profile.stripe_customer_id;
        } else {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabase_user_id: user.id
                }
            });
            customerId = customer.id;

            // Save customer ID to profile
            await supabaseClient.from('profiles').update({
                stripe_customer_id: customerId
            }).eq('id', user.id);
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${returnUrl}`,
            metadata: {
                user_id: user.id
            }
        })

        return new Response(
            JSON.stringify({ url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
