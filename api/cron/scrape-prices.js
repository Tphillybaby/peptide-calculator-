/**
 * Vercel Cron Job: Auto-trigger price scraping twice daily
 * Schedule: 6am and 6pm UTC
 * 
 * This calls the Supabase Edge Function scrape-prices
 * Authorization is checked via CRON_SECRET env var
 */

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // Verify this is being called by Vercel Cron (not a public user)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return new Response(JSON.stringify({ error: 'Missing Supabase configuration' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        console.log('[Cron] Triggering price scrape at', new Date().toISOString());

        const response = await fetch(`${supabaseUrl}/functions/v1/scrape-prices`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}), // Scrape all active vendors
        });

        const result = await response.json();

        console.log('[Cron] Scrape result:', JSON.stringify(result));

        return new Response(JSON.stringify({
            success: true,
            timestamp: new Date().toISOString(),
            result,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('[Cron] Scrape failed:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
