export default function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    // Only the public VAPID key belongs on the frontend host. Delivery and private
    // keys live in Supabase; this flag is enabled after the cron smoke test passes.
    if (!process.env.VAPID_PUBLIC_KEY || process.env.BACKGROUND_REMINDERS_ENABLED !== 'true') {
        return res.status(503).json({ error: 'Background reminders are not configured.' });
    }
    return res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
}
