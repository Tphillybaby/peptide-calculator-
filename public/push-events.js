/* Runs inside the generated PWA service worker, even while the website is closed. */
self.addEventListener('push', event => {
    let payload = {};
    try { payload = event.data?.json() || {}; } catch { /* use generic reminder */ }
    event.waitUntil(self.registration.showNotification(payload.title || 'PeptideLog reminder', {
        body: payload.body || 'You have a scheduled reminder. Open PeptideLog to review it.',
        icon: '/pwa-192x192.png',
        tag: payload.tag || 'peptidelog-reminder',
        data: { url: '/log' }
    }));
});
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const existing = windows.find(client => new URL(client.url).origin === self.location.origin);
        if (existing) {
            await existing.navigate('/log');
            return existing.focus();
        }
        return self.clients.openWindow('/log');
    })());
});
