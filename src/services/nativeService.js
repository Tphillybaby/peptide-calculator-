/**
 * Native Mobile Service
 * Handles native device features via Capacitor
 */

import { Capacitor } from '@capacitor/core';

// Only import native plugins when running on native
const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform(); // 'ios', 'android', or 'web'

/**
 * Haptic Feedback
 */
export const haptics = {
    async impact(style = 'medium') {
        if (!isNative) return;
        try {
            const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
            const impactStyles = {
                light: ImpactStyle.Light,
                medium: ImpactStyle.Medium,
                heavy: ImpactStyle.Heavy,
            };
            await Haptics.impact({ style: impactStyles[style] || ImpactStyle.Medium });
        } catch (e) {
            console.log('Haptics not available', e);
        }
    },

    async notification(type = 'success') {
        if (!isNative) return;
        try {
            const { Haptics, NotificationType } = await import('@capacitor/haptics');
            const notificationTypes = {
                success: NotificationType.Success,
                warning: NotificationType.Warning,
                error: NotificationType.Error,
            };
            await Haptics.notification({ type: notificationTypes[type] || NotificationType.Success });
        } catch (e) {
            console.log('Haptics not available', e);
        }
    },

    async vibrate(duration = 300) {
        if (!isNative) return;
        try {
            const { Haptics } = await import('@capacitor/haptics');
            await Haptics.vibrate({ duration });
        } catch (e) {
            console.log('Haptics not available', e);
        }
    }
};

/**
 * Local Notifications (for injection reminders)
 */
export const localNotifications = {
    async requestPermission() {
        if (!isNative) return false;
        try {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const result = await LocalNotifications.requestPermissions();
            return result.display === 'granted';
        } catch (e) {
            console.log('Local notifications not available', e);
            return false;
        }
    },

    async schedule(notifications) {
        if (!isNative) return;
        try {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            await LocalNotifications.schedule({ notifications });
        } catch (e) {
            console.log('Failed to schedule notification', e);
        }
    },

    async scheduleInjectionReminder({ id, title, body, scheduledAt }) {
        return this.schedule([{
            id,
            title: title || 'PeptideLog Reminder',
            body,
            schedule: { at: scheduledAt },
            sound: 'default',
            smallIcon: 'ic_stat_icon',
            iconColor: '#8b5cf6',
            actionTypeId: 'INJECTION_REMINDER',
            extra: { type: 'injection_reminder' }
        }]);
    },

    async cancel(ids) {
        if (!isNative) return;
        try {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
        } catch (e) {
            console.log('Failed to cancel notifications', e);
        }
    },

    async getPending() {
        if (!isNative) return [];
        try {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const result = await LocalNotifications.getPending();
            return result.notifications;
        } catch (e) {
            console.log('Failed to get pending notifications', e);
            return [];
        }
    }
};

/**
 * Push Notifications (for server-sent alerts)
 */
export const pushNotifications = {
    async register() {
        if (!isNative) return null;
        try {
            const { PushNotifications } = await import('@capacitor/push-notifications');

            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.log('Push notification permission not granted');
                return null;
            }

            await PushNotifications.register();

            return new Promise((resolve) => {
                PushNotifications.addListener('registration', (token) => {
                    resolve(token.value);
                });

                PushNotifications.addListener('registrationError', (error) => {
                    console.error('Push registration error:', error);
                    resolve(null);
                });
            });
        } catch (e) {
            console.log('Push notifications not available', e);
            return null;
        }
    },

    async addListeners(callbacks = {}) {
        if (!isNative) return;
        try {
            const { PushNotifications } = await import('@capacitor/push-notifications');

            if (callbacks.onReceive) {
                PushNotifications.addListener('pushNotificationReceived', callbacks.onReceive);
            }

            if (callbacks.onTap) {
                PushNotifications.addListener('pushNotificationActionPerformed', callbacks.onTap);
            }
        } catch (e) {
            console.log('Failed to add push notification listeners', e);
        }
    }
};

/**
 * Status Bar
 */
export const statusBar = {
    async setStyle(style = 'dark') {
        if (!isNative) return;
        try {
            const { StatusBar, Style } = await import('@capacitor/status-bar');
            await StatusBar.setStyle({ style: style === 'dark' ? Style.Dark : Style.Light });
        } catch (e) {
            console.log('Status bar not available', e);
        }
    },

    async setBackgroundColor(color) {
        if (!isNative || platform !== 'android') return;
        try {
            const { StatusBar } = await import('@capacitor/status-bar');
            await StatusBar.setBackgroundColor({ color });
        } catch (e) {
            console.log('Status bar not available', e);
        }
    },

    async hide() {
        if (!isNative) return;
        try {
            const { StatusBar } = await import('@capacitor/status-bar');
            await StatusBar.hide();
        } catch (e) {
            console.log('Status bar not available', e);
        }
    },

    async show() {
        if (!isNative) return;
        try {
            const { StatusBar } = await import('@capacitor/status-bar');
            await StatusBar.show();
        } catch (e) {
            console.log('Status bar not available', e);
        }
    }
};

/**
 * Splash Screen
 */
export const splashScreen = {
    async hide() {
        if (!isNative) return;
        try {
            const { SplashScreen } = await import('@capacitor/splash-screen');
            await SplashScreen.hide();
        } catch (e) {
            console.log('Splash screen not available', e);
        }
    },

    async show(options = {}) {
        if (!isNative) return;
        try {
            const { SplashScreen } = await import('@capacitor/splash-screen');
            await SplashScreen.show(options);
        } catch (e) {
            console.log('Splash screen not available', e);
        }
    }
};

/**
 * Browser (for external links)
 */
export const browser = {
    async open(url) {
        try {
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({ url });
        } catch {
            // Fallback to window.open for web
            window.open(url, '_blank');
        }
    },

    async close() {
        if (!isNative) return;
        try {
            const { Browser } = await import('@capacitor/browser');
            await Browser.close();
        } catch (e) {
            console.log('Browser close not available', e);
        }
    }
};

/**
 * Share
 */
export const share = {
    async share({ title, text, url, files }) {
        try {
            const { Share } = await import('@capacitor/share');
            await Share.share({ title, text, url, files });
        } catch {
            // Fallback to Web Share API
            if (navigator.share) {
                await navigator.share({ title, text, url });
            } else {
                // Copy to clipboard as last resort
                const shareText = `${title}\n${text}\n${url}`;
                await navigator.clipboard.writeText(shareText);
                alert('Link copied to clipboard!');
            }
        }
    },

    async canShare() {
        try {
            const { Share } = await import('@capacitor/share');
            const result = await Share.canShare();
            return result.value;
        } catch {
            return !!navigator.share;
        }
    }
};

/**
 * App Events
 */
export const appEvents = {
    async addStateListener(callback) {
        try {
            const { App } = await import('@capacitor/app');
            App.addListener('appStateChange', callback);
        } catch {
            // Not available on web
        }
    },

    async addUrlListener(callback) {
        try {
            const { App } = await import('@capacitor/app');
            App.addListener('appUrlOpen', callback);
        } catch {
            // Not available on web
        }
    },

    async addBackButtonListener(callback) {
        if (platform !== 'android') return;
        try {
            const { App } = await import('@capacitor/app');
            App.addListener('backButton', callback);
        } catch {
            // Not available
        }
    },

    async exitApp() {
        if (platform !== 'android') return;
        try {
            const { App } = await import('@capacitor/app');
            await App.exitApp();
        } catch {
            // Not available
        }
    }
};

/**
 * Platform detection helpers
 */
export const device = {
    isNative,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
};

/**
 * Initialize native services
 */
export async function initializeNativeServices() {
    if (!isNative) return;

    // Set up status bar
    await statusBar.setStyle('dark');
    if (platform === 'android') {
        await statusBar.setBackgroundColor('#0f172a');
    }

    // Hide splash screen after a small delay (let app render)
    setTimeout(() => {
        splashScreen.hide();
    }, 500);

    // Request notification permissions
    await localNotifications.requestPermission();

    console.log(`PeptideLog running on ${platform}`);
}

export default {
    haptics,
    localNotifications,
    pushNotifications,
    statusBar,
    splashScreen,
    browser,
    share,
    appEvents,
    device,
    initializeNativeServices,
};
