export const notificationService = {
    requestPermission: async () => {
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    },

    sendNotification: (title, options = {}) => {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                ...options
            });

            notification.onclick = function () {
                window.focus();
                notification.close();
            };
        }
    },

    scheduleNotification: (title, options, delayMs) => {
        setTimeout(() => {
            notificationService.sendNotification(title, options);
        }, delayMs);
    }
};
