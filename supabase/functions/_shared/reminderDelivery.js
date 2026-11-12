import { isAllowedPushEndpoint, dueReminderTypes } from './reminderUtils.js';

export async function deliverReminders(db, sendNotification, vapidDetails, now = Date.now()) {
    let sent = 0;
    let failed = 0;
    const { data: schedules, error } = await db.from('schedules').select('id,user_id,scheduled_at')
        .eq('completed', false).gte('scheduled_at', new Date(now - 5 * 60000).toISOString())
        .lte('scheduled_at', new Date(now + 30 * 60000).toISOString());
    if (error) throw error;
    for (const schedule of schedules) {
        const types = dueReminderTypes(schedule.scheduled_at, now);
        if (!types.length) continue;
        const { data: profile, error: profileError } = await db.from('profiles').select('notification_preferences').eq('id', schedule.user_id).single();
        if (profileError || profile?.notification_preferences?.injectionReminders !== true) continue;
        const { data: subscriptions, error: subError } = await db.from('push_subscriptions').select('id,endpoint,subscription').eq('user_id', schedule.user_id);
        if (subError) throw subError;
        for (const subscription of subscriptions) {
            if (!isAllowedPushEndpoint(subscription.endpoint) || subscription.subscription?.endpoint !== subscription.endpoint) continue;
            for (const minutes of types) {
                const token = crypto.randomUUID();
                const { data: claimed, error: claimError } = await db.rpc('claim_reminder_delivery', {
                    p_schedule_id: schedule.id, p_subscription_id: subscription.id,
                    p_scheduled_at: schedule.scheduled_at, p_minutes: minutes, p_token: token
                });
                if (claimError) throw claimError;
                if (!claimed) continue;
                try {
                    // Recheck after claiming so a completed/cancelled dose is not sent from a stale query.
                    const { data: current } = await db.from('schedules').select('completed,scheduled_at').eq('id', schedule.id).maybeSingle();
                    if (!current || current.completed || current.scheduled_at !== schedule.scheduled_at) continue;
                    await sendNotification(subscription.subscription, JSON.stringify({
                        title: 'PeptideLog reminder',
                        body: minutes ? 'You have a dose scheduled in 30 minutes. Open PeptideLog to review it.' : 'You have a dose scheduled now. Open PeptideLog to review it.',
                        tag: `dose-${schedule.id}-${minutes}`
                    }), { TTL: 300, timeout: 10000, vapidDetails: vapidDetails });
                    const { error: sentError } = await db.from('reminder_deliveries').update({ sent_at: new Date().toISOString() }).eq('lease_token', token);
                    if (sentError) throw sentError;
                    sent++;
                } catch (deliveryError) {
                    failed++;
                    if ([404, 410].includes(deliveryError.statusCode)) {
                        await db.from('push_subscriptions').delete().eq('id', subscription.id);
                    }
                }
            }
        }
    }
    return { sent, failed };
}
