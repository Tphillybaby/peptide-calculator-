export default function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.CRON_SECRET) {
        return res.status(503).json({ error: 'Background reminders are not configured.' });
    }
    return res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
}
