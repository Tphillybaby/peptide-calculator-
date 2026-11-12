import { localDateString } from '../utils/scheduleTime';
import { device, localNotifications } from './nativeService';
import { webPushService } from './webPushService';

/**
 * Enhanced Push Notification Service for scheduled dose reminders and alerts
 */
class NotificationServiceClass {
    constructor() {
        this.scheduledNotifications = new Map();
    }

    /**
     * Check if notifications are supported
     */
    isSupported() {
        return device.isNative || (typeof window !== 'undefined' && 'Notification' in window);
    }

    /**
     * Request notification permission
     */
    async requestPermission() {
        if (!this.isSupported()) {
            console.log('This browser does not support desktop notification');
            return false;
        }

        try {
            if (device.isNative) return await localNotifications.requestPermission();
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch { return false; }
    }

    /**
     * Check current permission status
     */
    getPermission() {
        if (!this.isSupported()) return 'unsupported';
        return device.isNative ? 'default' : Notification.permission;
    }

    /**
     * Send an immediate notification
     */
    async sendNotification(title, options = {}) {
        if (!this.isSupported()) return null;
        try {
            if (device.isNative) {
                await localNotifications.schedule([{ id: Date.now() % 2147483647, title, body: options.body }]);
                return true;
            }
            if (Notification.permission !== 'granted') return null;
            const { onClick, ...notificationOptions } = options;
            const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
            if (registration) {
                await registration.showNotification(title, { icon: '/pwa-192x192.png', ...notificationOptions });
                return true;
            }
            const notification = new Notification(title, { icon: '/pwa-192x192.png', ...notificationOptions });
            notification.onclick = () => { window.focus(); notification.close(); onClick?.(); };
            return notification;
        } catch (error) {
            console.warn('Notification could not be displayed:', error.message);
            return null;
        }
    }

    /**
     * Schedule a notification for a future time
     */
    scheduleNotification(id, scheduledTime, title, options = {}) {
        // Clear any existing notification with this ID
        this.cancelNotification(id);

        const now = new Date();
        const targetTime = new Date(scheduledTime);
        const delay = targetTime.getTime() - now.getTime();

        // Don't schedule if the time has passed
        if (!Number.isFinite(delay) || delay <= 0) {
            return false;
        }

        // Schedule the notification
        // Browser timers overflow after ~24.8 days. Re-arm long reminders safely.
        const timeoutId = setTimeout(() => {
            if (Date.now() < targetTime.getTime()) {
                this.scheduleNotification(id, scheduledTime, title, options);
                return;
            }
            this.sendNotification(title, options);
            this.scheduledNotifications.delete(id);
        }, Math.min(delay, 2147483647));

        this.scheduledNotifications.set(id, timeoutId);
        return true;
    }

    /**
     * Legacy method for backwards compatibility
     */
    scheduleNotificationDelay(title, options, delayMs) {
        setTimeout(() => {
            this.sendNotification(title, options);
        }, delayMs);
    }

    /**
     * Cancel a scheduled notification
     */
    cancelNotification(id) {
        if (this.scheduledNotifications.has(id)) {
            clearTimeout(this.scheduledNotifications.get(id));
            this.scheduledNotifications.delete(id);
            return true;
        }
        return false;
    }

    /**
     * Cancel all scheduled notifications
     */
    cancelAllNotifications() {
        this.scheduledNotifications.forEach((timeoutId) => {
            clearTimeout(timeoutId);
        });
        this.scheduledNotifications.clear();
    }

    /**
     * Schedule reminders for all upcoming doses
     * @param {Array} schedules - Array of scheduled doses
     * @param {number} reminderMinutes - Minutes before the dose to remind (default: 30)
     */
    scheduleReminders(schedules, reminderMinutes = 30) {
        // Cancel existing reminders
        this.cancelAllNotifications();

        const now = new Date();
        let scheduledCount = 0;

        schedules.forEach(schedule => {
            if (schedule.completed) return;

            // Parse the schedule date and time
            let scheduleDateTime;
            if (schedule.scheduled_date && schedule.scheduled_time) {
                scheduleDateTime = new Date(`${schedule.scheduled_date}T${schedule.scheduled_time}`);
            } else if (schedule.date) {
                scheduleDateTime = new Date(schedule.date);
            } else {
                return;
            }

            // Calculate reminder time (X minutes before)
            const reminderTime = new Date(scheduleDateTime.getTime() - (reminderMinutes * 60 * 1000));

            // Only schedule if reminder time is in the future
            if (reminderTime > now) {
                const peptideName = schedule.peptide_name || schedule.peptide || 'your peptide';
                const dosage = schedule.dosage || '';
                const unit = schedule.unit || 'mg';

                this.scheduleNotification(
                    `reminder-${schedule.id}`,
                    reminderTime,
                    `⏰ Dose Reminder`,
                    {
                        body: `Time to take ${peptideName} (${dosage}${unit}) in ${reminderMinutes} minutes`,
                        tag: `dose-reminder-${schedule.id}`
                    }
                );
                scheduledCount++;
            }

            // Also schedule a notification at the exact time
            if (scheduleDateTime > now) {
                const peptideName = schedule.peptide_name || schedule.peptide || 'your peptide';
                const dosage = schedule.dosage || '';
                const unit = schedule.unit || 'mg';

                this.scheduleNotification(
                    `dose-${schedule.id}`,
                    scheduleDateTime,
                    `💉 Time for your dose!`,
                    {
                        body: `Take ${peptideName} - ${dosage}${unit}`,
                        tag: `dose-${schedule.id}`,
                        requireInteraction: true
                    }
                );
                scheduledCount++;
            }
        });

        return scheduledCount;
    }

    /**
     * Send low stock alert
     */
    sendLowStockAlert(peptideName, remainingAmount, unit = 'mg') {
        return this.sendNotification('⚠️ Low Stock Alert', {
            body: `${peptideName} is running low (${remainingAmount}${unit} remaining)`,
            tag: `low-stock-${peptideName}`,
            requireInteraction: true
        });
    }
}

// Create singleton instance
const notificationServiceInstance = new NotificationServiceClass();

// Export both the instance and named exports for compatibility
export const notificationService = {
    requestPermission: () => notificationServiceInstance.requestPermission(),
    enableReminders: async (userId) => {
        if (!userId) throw new Error('Sign in to enable background reminders.');
        if (device.isNative) {
            if (!await localNotifications.requestPermission()) throw new Error('Notification permission was not granted.');
        } else {
            await webPushService.enable(userId);
        }
        const { supabase } = await import('../lib/supabase');
        // Legacy schedules were stored as local date/time. On opt-in, preserve the
        // times currently shown on this device and persist their UTC instants.
        const { data: legacySchedules, error: scheduleError } = await supabase.from('schedules')
            .select('id,scheduled_date,scheduled_time').eq('user_id', userId)
            .is('scheduled_at', null).eq('completed', false).gte('scheduled_date', localDateString(new Date()));
        if (scheduleError) throw scheduleError;
        for (const schedule of legacySchedules || []) {
            const instant = new Date(`${schedule.scheduled_date}T${schedule.scheduled_time || '08:00:00'}`);
            if (!Number.isFinite(instant.getTime())) throw new Error('An existing schedule has an invalid time. Please edit or recreate it.');
            if (instant <= new Date()) continue;
            const { error } = await supabase.from('schedules').update({ scheduled_at: instant.toISOString() })
                .eq('id', schedule.id).eq('user_id', userId).is('scheduled_at', null);
            if (error) throw error;
        }
        const { data, error: readError } = await supabase.from('profiles').select('notification_preferences').eq('id', userId).single();
        if (readError) throw readError;
        const { error } = await supabase.from('profiles').update({ notification_preferences: { ...data.notification_preferences, injectionReminders: true } }).eq('id', userId);
        if (error) throw error;
        try { localStorage.setItem('peptidelog_reminders_enabled', 'true'); } catch { /* storage unavailable */ }
        window.dispatchEvent(new Event('reminder-preferences-changed'));
        return true;
    },
    disableReminders: async () => {
        try { localStorage.setItem('peptidelog_reminders_enabled', 'false'); } catch { /* storage unavailable */ }
        window.dispatchEvent(new Event('reminder-preferences-changed'));
        notificationServiceInstance.cancelAllNotifications();
        if (device.isNative) {
            const pending = await localNotifications.getPending();
            await localNotifications.cancel(pending.map(item => item.id));
        } else {
            await webPushService.disable();
        }
    },
    sendNotification: (title, options) => notificationServiceInstance.sendNotification(title, options),
    scheduleNotification: (title, options, delayMs) => notificationServiceInstance.scheduleNotificationDelay(title, options, delayMs),
    scheduleReminders: (schedules, minutes) => notificationServiceInstance.scheduleReminders(schedules, minutes),
    cancelAllNotifications: () => notificationServiceInstance.cancelAllNotifications(),
    sendLowStockAlert: (name, amount, unit) => notificationServiceInstance.sendLowStockAlert(name, amount, unit),
    getPermission: () => notificationServiceInstance.getPermission(),
    isSupported: () => notificationServiceInstance.isSupported()
};

export default notificationService;
