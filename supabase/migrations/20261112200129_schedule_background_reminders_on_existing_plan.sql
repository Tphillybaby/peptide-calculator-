-- Run after the migrations and Supabase runtime configuration.
-- Enable pg_cron and pg_net in Supabase's Extensions panel if not already enabled.
-- Create Vault JSON secret `peptidelog_reminder_config` with cronSecret, publicKey,
-- privateKey, and subject. Never commit the value.
-- This script changes no subscriptions or billing plans.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
       OR NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        RAISE EXCEPTION 'Enable pg_cron and pg_net before scheduling reminders';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'peptidelog_reminder_config' AND length(decrypted_secret::jsonb->>'cronSecret') >= 32) THEN
        RAISE EXCEPTION 'Configure the reminder secret in Vault first';
    END IF;
    PERFORM cron.schedule(
        'peptidelog-background-reminders',
        '* * * * *',
        $job$
        SELECT net.http_post(
            url := 'https://nhiwjerqyhtpienorzky.supabase.co/functions/v1/send-reminders',
            headers := jsonb_build_object('Authorization', 'Bearer ' || (
                SELECT decrypted_secret::jsonb->>'cronSecret' FROM vault.decrypted_secrets
                WHERE name = 'peptidelog_reminder_config'
            )),
            body := '{}'::jsonb,
            timeout_milliseconds := 10000
        );
        $job$
    );
END $$;
