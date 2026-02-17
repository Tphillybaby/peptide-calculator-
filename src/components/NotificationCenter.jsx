import React, { useState, useEffect } from 'react';
import {
    Bell, BellOff, Settings, Clock, Package,
    TrendingDown, Trophy, BookOpen, Check, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import notificationService from '../services/notificationService';
import styles from './NotificationCenter.module.css';

const DEFAULT_PREFERENCES = {
    push_enabled: true,
    dose_reminders: true,
    reminder_minutes_before: 30,
    low_stock_alerts: true,
    price_drop_alerts: true,
    weekly_summary: true,
    achievement_alerts: true,
    research_updates: false
};

const NotificationCenter = ({ onClose }) => {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const [permissionStatus, setPermissionStatus] = useState('default');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [testSent, setTestSent] = useState(false);

    // Load preferences and check permission
    useEffect(() => {
        const initialize = async () => {
            // Check notification permission
            const status = notificationService.getPermission();
            setPermissionStatus(status);

            // Load user preferences
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('notification_preferences')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();

                    if (data) {
                        setPreferences(data);
                    } else if (error && error.code === 'PGRST116') {
                        // No preferences yet, create default
                        await supabase
                            .from('notification_preferences')
                            .insert({
                                user_id: user.id,
                                ...DEFAULT_PREFERENCES
                            });
                    }
                } catch (err) {
                    console.error('Error loading preferences:', err);
                }
            }
            setLoading(false);
        };

        initialize();
    }, [user]);

    // Request permission
    const handleRequestPermission = async () => {
        const granted = await notificationService.requestPermission();
        setPermissionStatus(granted ? 'granted' : 'denied');
    };

    // Save preferences
    const handleSavePreferences = async () => {
        if (!user) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('notification_preferences')
                .upsert({
                    user_id: user.id,
                    ...preferences,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;
        } catch (err) {
            console.error('Error saving preferences:', err);
        } finally {
            setSaving(false);
        }
    };

    // Toggle preference
    const togglePreference = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Update reminder time
    const updateReminderTime = (minutes) => {
        setPreferences(prev => ({
            ...prev,
            reminder_minutes_before: minutes
        }));
    };

    // Send test notification
    const sendTestNotification = () => {
        notificationService.sendNotification('🧪 Test Notification', {
            body: 'Push notifications are working correctly!',
            tag: 'test'
        });
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3000);
    };

    const notificationTypes = [
        {
            key: 'dose_reminders',
            icon: Clock,
            title: 'Dose Reminders',
            description: 'Get notified before scheduled doses',
            color: '#10b981'
        },
        {
            key: 'low_stock_alerts',
            icon: Package,
            title: 'Low Stock Alerts',
            description: 'Alerts when inventory is running low',
            color: '#f59e0b'
        },
        {
            key: 'price_drop_alerts',
            icon: TrendingDown,
            title: 'Price Drops',
            description: 'Notifications for tracked price alerts',
            color: '#06b6d4'
        },
        {
            key: 'achievement_alerts',
            icon: Trophy,
            title: 'Achievements',
            description: 'Celebrate when you unlock achievements',
            color: '#8b5cf6'
        },
        {
            key: 'weekly_summary',
            icon: Bell,
            title: 'Weekly Summary',
            description: 'Digest of your weekly activity',
            color: '#3b82f6'
        },
        {
            key: 'research_updates',
            icon: BookOpen,
            title: 'Research Updates',
            description: 'New studies and papers added',
            color: '#ec4899'
        }
    ];

    const reminderOptions = [15, 30, 60, 120];

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <Bell size={24} />
                    <h2>Notifications</h2>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={`${styles.settingsBtn} ${showSettings ? styles.active : ''}`}
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <Settings size={18} />
                    </button>
                    {onClose && (
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Permission Banner */}
            {permissionStatus !== 'granted' && (
                <div className={styles.permissionBanner}>
                    {permissionStatus === 'denied' ? (
                        <>
                            <BellOff size={24} />
                            <div>
                                <h3>Notifications Blocked</h3>
                                <p>Enable notifications in your browser settings to receive alerts</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Bell size={24} />
                            <div>
                                <h3>Enable Push Notifications</h3>
                                <p>Get reminders for doses, low stock alerts, and more</p>
                            </div>
                            <button onClick={handleRequestPermission} className={styles.enableBtn}>
                                Enable
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && permissionStatus === 'granted' && (
                <div className={styles.settingsPanel}>
                    {/* Master Toggle */}
                    <div className={styles.masterToggle}>
                        <div className={styles.toggleInfo}>
                            <span className={styles.toggleTitle}>Push Notifications</span>
                            <span className={styles.toggleDesc}>Enable/disable all notifications</span>
                        </div>
                        <button
                            className={`${styles.toggle} ${preferences.push_enabled ? styles.on : ''}`}
                            onClick={() => togglePreference('push_enabled')}
                        >
                            <span className={styles.toggleKnob} />
                        </button>
                    </div>

                    {preferences.push_enabled && (
                        <>
                            {/* Notification Types */}
                            <div className={styles.notificationTypes}>
                                {notificationTypes.map(type => (
                                    <div key={type.key} className={styles.notificationType}>
                                        <div
                                            className={styles.typeIcon}
                                            style={{ background: `${type.color}15`, color: type.color }}
                                        >
                                            <type.icon size={18} />
                                        </div>
                                        <div className={styles.typeInfo}>
                                            <span className={styles.typeTitle}>{type.title}</span>
                                            <span className={styles.typeDesc}>{type.description}</span>
                                        </div>
                                        <button
                                            className={`${styles.toggle} ${preferences[type.key] ? styles.on : ''}`}
                                            onClick={() => togglePreference(type.key)}
                                        >
                                            <span className={styles.toggleKnob} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Reminder Time */}
                            {preferences.dose_reminders && (
                                <div className={styles.reminderTime}>
                                    <span className={styles.reminderLabel}>Remind me before dose:</span>
                                    <div className={styles.reminderOptions}>
                                        {reminderOptions.map(minutes => (
                                            <button
                                                key={minutes}
                                                className={`${styles.reminderOption} ${preferences.reminder_minutes_before === minutes ? styles.active : ''}`}
                                                onClick={() => updateReminderTime(minutes)}
                                            >
                                                {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Test & Save */}
                            <div className={styles.settingsActions}>
                                <button
                                    className={styles.testBtn}
                                    onClick={sendTestNotification}
                                    disabled={testSent}
                                >
                                    {testSent ? (
                                        <><Check size={16} /> Sent!</>
                                    ) : (
                                        <>Send Test Notification</>
                                    )}
                                </button>
                                <button
                                    className={styles.saveBtn}
                                    onClick={handleSavePreferences}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Recent Notifications (Placeholder) */}
            {!showSettings && (
                <div className={styles.notificationsList}>
                    <div className={styles.emptyNotifications}>
                        <Bell size={40} />
                        <h3>No new notifications</h3>
                        <p>You're all caught up! Notifications will appear here.</p>
                    </div>
                </div>
            )}

            {/* Quick Links */}
            {!showSettings && user && (
                <div className={styles.quickLinks}>
                    <button
                        className={styles.quickLink}
                        onClick={() => setShowSettings(true)}
                    >
                        <Settings size={18} />
                        Notification Settings
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Guest Message */}
            {!user && (
                <div className={styles.guestMessage}>
                    <Bell size={32} />
                    <h3>Sign in for notifications</h3>
                    <p>Create an account to receive dose reminders and alerts</p>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
