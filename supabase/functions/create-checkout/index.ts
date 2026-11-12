import {checkoutOptions} from './options.js';
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno'

const corsHeaders = {
    'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://peptidelog.net',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
    const origin=req.headers.get('origin');
    if(origin && !['https://peptidelog.net','https://www.peptidelog.net'].includes(origin)) return new Response('Origin not allowed',{status:403});
    const responseHeaders={...corsHeaders,'Access-Control-Allow-Origin':origin||'https://peptidelog.net'};
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: responseHeaders })
    }

    if(req.method!=='POST')return new Response('Method not allowed',{status:405,headers:responseHeaders});
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

        if (!user) return new Response(JSON.stringify({error:'User not authenticated'}),{status:401,headers:{...responseHeaders,'Content-Type':'application/json'}});
        const stripeKey=Deno.env.get('STRIPE_SECRET_KEY');
        if(!stripeKey)return new Response(JSON.stringify({error:'Checkout is not configured.'}),{status:503,headers:{...responseHeaders,'Content-Type':'application/json'}});
        const stripe=new Stripe(stripeKey,{apiVersion:'2022-11-15',httpClient:Stripe.createFetchHttpClient()});

        const { priceId, returnUrl } = await req.json()

        // Validate plans and return URLs before contacting Stripe.
        checkoutOptions({priceId,returnUrl,customerId:'validation-only',userId:user.id});
        const adminClient=createClient(Deno.env.get('SUPABASE_URL') ?? '',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

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
            const {error:saveError}=await adminClient.from('profiles').update({
                stripe_customer_id: customerId
            }).eq('id', user.id).select('id').single();
            if(saveError)throw new Error('Could not save billing customer.');
        }

        const session = await stripe.checkout.sessions.create(checkoutOptions({priceId,returnUrl,customerId,userId:user.id}) as Stripe.Checkout.SessionCreateParams);

        return new Response(
            JSON.stringify({ url: session.url }),
            {
                headers: { ...responseHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                headers: { ...responseHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
