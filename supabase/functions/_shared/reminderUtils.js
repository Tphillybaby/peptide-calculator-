// Only allow known browser push services; subscription endpoints are user input.
export function isAllowedPushEndpoint(endpoint) {
    try {
        const url = new URL(endpoint);
        const hosts = ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'];
        return url.protocol === 'https:' && !url.port && !url.username && !url.password &&
            (hosts.includes(url.hostname) || url.hostname.endsWith('.notify.windows.com') || url.hostname.endsWith('.push.apple.com'));
    } catch { return false; }
}
export function dueReminderTypes(scheduledAt, now = Date.now()) {
    const time = new Date(scheduledAt).getTime();
    if (!Number.isFinite(time)) return [];
    return [30, 0].filter(minutes => {
        const lag = now - (time - minutes * 60000);
        return lag >= 0 && lag < 5 * 60000;
    });
}
