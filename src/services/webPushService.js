import { supabase } from '../lib/supabase';

export const webPushService = {
    supported() {
        return typeof window !== 'undefined' && 'Notification' in window &&
            'serviceWorker' in navigator && 'PushManager' in window;
    },
    async enable(userId) {
        if (!userId) throw new Error('Sign in to enable reminders when the website is closed.');
        if (!this.supported()) throw new Error('Push is unavailable here. On iPhone, add PeptideLog to your Home Screen and open it there.');
        // Request from the user gesture before any network work (required by Safari).
        if (await Notification.requestPermission() !== 'granted') throw new Error('Notification permission was not granted.');
        const response = await fetch('/api/push-config');
        const config = await response.json();
        if (!response.ok || !config.publicKey) throw new Error('Background reminders are not configured yet.');
        const registration = await navigator.serviceWorker.register('/sw.js');
        await Promise.race([
            navigator.serviceWorker.ready,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Notification service is not ready. Try again.')), 10000))
        ]);
        const existing = await registration.pushManager.getSubscription();
        const key = Uint8Array.from(atob(config.publicKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
        const subscription = existing || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
        const { error } = await supabase.from('push_subscriptions').upsert({
            user_id: userId, endpoint: subscription.endpoint, subscription: subscription.toJSON()
        }, { onConflict: 'endpoint' });
        if (error) throw error;
        return true;
    },
    async disable() {
        if (!this.supported()) return;
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (!subscription) return;
        const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
        if (error) throw error;
        await subscription.unsubscribe();
    }
};
