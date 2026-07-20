-- Create email_subscribers table for newsletter/notification opt-ins
-- Captures emails from non-logged-in visitors to re-engage them

CREATE TABLE IF NOT EXISTS public.email_subscribers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    source text NOT NULL DEFAULT 'website', -- where they signed up: 'dashboard', 'encyclopedia', 'website'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT email_subscribers_email_key UNIQUE (email)
);

-- Row Level Security
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert their own email)
CREATE POLICY "Anyone can subscribe"
    ON email_subscribers FOR INSERT
    WITH CHECK (true);

-- Only admins can view the list (uses the existing is_admin() security-definer function)
CREATE POLICY "Admins can view subscribers"
    ON email_subscribers FOR SELECT
    USING (public.is_admin());

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS email_subscribers_email_idx ON public.email_subscribers (email);
CREATE INDEX IF NOT EXISTS email_subscribers_created_at_idx ON public.email_subscribers (created_at DESC);
