import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { device } from '../services/nativeService';
import { webPushService } from '../services/webPushService';
import { nextPlannedReminder, reminderLabel } from '../utils/reminderStatus';
import styles from './DailyTools.module.css';

export default function ReminderStatus({ schedules = [], settings = false }) {
    const { user, authReady } = useAuth();
    const [state, setState] = useState({ label: 'Checking reminders…', ready: false });
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        const check = async () => {
            if (!authReady) return;
            if (active) setState({ label: 'Checking reminders…', ready: false });
            try {
                if (!user) { if (active) setState({ label: 'Sign in to enable background reminders', ready: false }); return; }
                const { data, error } = await supabase.from('profiles').select('notification_preferences').eq('id', user.id).single();
                if (error) throw error;
                let prefs = data.notification_preferences || {};
                if (typeof prefs === 'string') prefs = JSON.parse(prefs);
                const enabled = Boolean(prefs.injectionReminders);
                let label;
                if (device.isNative) {
                    const { LocalNotifications } = await import('@capacitor/local-notifications');
                    const permission = await LocalNotifications.checkPermissions();
                    label = reminderLabel({ supported: true, permission: permission.display, enabled, configured: true, subscription: true });
                } else {
                    const supported = webPushService.supported();
                    const permission = supported ? Notification.permission : 'unsupported';
                    let connected = false, configured = false;
                    if (supported && enabled && permission === 'granted') {
                        const registration = await navigator.serviceWorker.getRegistration();
                        const sub = await registration?.pushManager.getSubscription();
                        if (sub) {
                            const result = await supabase.from('push_subscriptions').select('id').eq('user_id', user.id).eq('endpoint', sub.endpoint).limit(1);
                            if (result.error) throw result.error;
                            connected = Boolean(result.data?.length);
                        }
                        const response = await fetch('/api/push-config', { cache: 'no-store' });
                        const config = await response.json(); configured = response.ok && Boolean(config.publicKey);
                    }
                    label = reminderLabel({ supported, permission, enabled, configured, subscription: connected });
                }
                if (active) setState({ label, ready: label === 'Enabled on this device' });
            } catch { if (active) setState({ label: 'Could not verify reminder status', ready: false }); }
        };
        check();
        const refresh = () => check();
        const timer = window.setInterval(refresh, 60000);
        window.addEventListener('focus', refresh); window.addEventListener('reminder-preferences-changed', refresh);
        return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('reminder-preferences-changed', refresh); };
    }, [user?.id, authReady, revision]);
    const next = state.ready ? nextPlannedReminder(schedules) : null;
    return <section className={styles.panel} aria-label="Reminder status"><h2>Reminder status</h2><p role="status"><strong>{state.label}</strong></p>
        {next ? <p>Next planned reminder: {next.at.toLocaleString()} · {next.minutes ? '30 minutes before dose' : 'At scheduled dose time'}</p> : state.ready && <p>No upcoming reminder-ready doses. Open your schedule to add or update a dose.</p>}
        <p className={styles.muted}>Time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}. Delivery depends on your device connection and notification settings.</p>
        {!settings && <Link to="/settings?tab=notifications">Manage reminders</Link>} <button type="button" onClick={() => setRevision(r => r + 1)}>Refresh status</button>
    </section>;
}
