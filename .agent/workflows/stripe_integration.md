---
description: Integrate Stripe Payments
---

# Stripe Integration Workflow

This workflow outlines the steps to integrate Stripe payments into the Peptide Calculator application.

## Prerequisites
1.  **Stripe Account**: You must have a Stripe account created at [stripe.com](https://stripe.com).
2.  **API Keys**: Obtain your `Publishable Key` (pk_test_...) and `Secret Key` (sk_test_...) from the Stripe Dashboard.
3.  **Supabase Project**: Ensure your Supabase project is set up and CLI is installed (if developing locally).

## Step 1: Environment Variables
Add the following keys to your project's environment variables (e.g., `.env` for local, Supabase Dashboard for production).

```bash
# Public (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Secret (Backend / Edge Functions ONLY)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 2: Create "create-checkout" Edge Function
This function allows authenticated users to initiate a purchase session.

1.  Create `supabase/functions/create-checkout/index.ts`.
2.  It should:
    -   Verify the user's Supabase auth token.
    -   Initialize the Stripe client.
    -   Create a Stripe Checkout Session for the requested Price ID.
    -   Return the `url` for the frontend to redirect to.

## Step 3: Create "stripe-webhook" Edge Function
This function listens for events from Stripe (e.g., `checkout.session.completed`, `invoice.payment_succeeded`).

1.  Create `supabase/functions/stripe-webhook/index.ts`.
2.  It should:
    -   Verify the Stripe signature using `STRIPE_WEBHOOK_SECRET`.
    -   Handle relevant events:
        -   `checkout.session.completed`: Update `user_subscriptions` table to mark start/end dates.
        -   `customer.subscription.updated`: Extend expiration dates.
        -   `customer.subscription.deleted`: Mark subscription as inactive.

## Step 4: Frontend Integration
1.  Install the Stripe loader: `npm install @stripe/stripe-js`
2.  Update `src/services/paymentService.js`:
    -   Replace placeholder `createCheckoutSession` with a real call to `supabase.functions.invoke('create-checkout', ...)`
    -   Handle the response by redirecting `window.location.href` to the Stripe URL.

## Step 5: Testing
1.  Use Stripe's "Test Mode".
2.  Use test card numbers (e.g., 4242 4242...) to simulate successful payments.
3.  Verify that the `user_subscriptions` table updates correctly in Supabase.
