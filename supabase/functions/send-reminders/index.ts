import { createClient } from '@supabase/supabase-js';
import * as webpush from 'web-push';
import { deliverReminders } from '../_shared/reminderDelivery.js';

// This function performs its own shared-secret authentication. Runtime admin
// credentials are provided by Supabase and never leave the trusted server.
Deno.serve(async (req: Request) => {
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
    const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
    if (req.method !== 'POST') return respond(405, { error: 'Method not allowed' });
    const authorization = req.headers.get('authorization') || '';
    if (!authorization.startsWith('Bearer ') || authorization.length < 40) return respond(401, { error: 'Unauthorized' });
    try {
        const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
        const { data: config, error } = await db.rpc('reminder_runtime_config');
        if (error || !config?.cronSecret || !config?.privateKey || !config?.publicKey || !config?.subject) return respond(503, { error: 'Reminders are not configured' });
        const hash = async (value: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
        const expected = await hash(`Bearer ${config.cronSecret}`);
        const actual = await hash(authorization);
        let difference = 0;
        for (let i = 0; i < expected.length; i++) difference |= expected[i] ^ actual[i];
        if (difference !== 0) return respond(401, { error: 'Unauthorized' });
        const result = await deliverReminders(db, webpush.sendNotification, {
            publicKey: config.publicKey, privateKey: config.privateKey, subject: config.subject
        });
        return respond(200, result);
    } catch (error) {
        console.error('Reminder delivery failed', error?.message);
        return respond(500, { error: 'Reminder delivery failed' });
    }
});
