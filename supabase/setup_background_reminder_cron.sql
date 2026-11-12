-- Run after the migrations and Vercel environment configuration.
-- Enable pg_cron and pg_net in Supabase's Extensions panel if not already enabled.
-- Create Vault secret `peptidelog_reminder_cron_secret` with the SAME value as
-- Vercel's CRON_SECRET through the Supabase dashboard (never commit the value).
-- This script changes no subscriptions or billing plans.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
       OR NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        RAISE EXCEPTION 'Enable pg_cron and pg_net before scheduling reminders';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'peptidelog_reminder_cron_secret' AND length(decrypted_secret) >= 32) THEN
        RAISE EXCEPTION 'Configure the reminder secret in Vault first';
    END IF;
    PERFORM cron.schedule(
        'peptidelog-background-reminders',
        '* * * * *',
        $job$
        SELECT net.http_get(
            url := 'https://peptidelog.net/api/cron/send-reminders',
            headers := jsonb_build_object('Authorization', 'Bearer ' || (
                SELECT decrypted_secret FROM vault.decrypted_secrets
                WHERE name = 'peptidelog_reminder_cron_secret'
            )),
            timeout_milliseconds := 10000
        );
        $job$
    );
END $$;
