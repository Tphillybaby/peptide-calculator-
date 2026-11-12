import { createClient } from '@supabase/supabase-js';
import * as webpush from 'web-push';
import { deliverReminders } from '../../supabase/functions/_shared/reminderDelivery.js';

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
    if (![VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT].every(Boolean)) {
        return res.status(503).json({ error: 'Background reminders are not configured.' });
    }
    const db = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    try {
        const result = await deliverReminders(db, webpush.sendNotification, { subject: VAPID_SUBJECT, publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY });
        return res.status(200).json(result);
    } catch (error) {
        console.error('[Reminders] Delivery job failed:', error.message);
        return res.status(500).json({ error: 'Reminder job failed' });
    }
}
