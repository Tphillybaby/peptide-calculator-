import React, { useState } from 'react';
import { User, Mail, Lock, Bell, Shield, Trash2, Download, Moon, Sun } from 'lucide-react';
import styles from './Settings.module.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState({
        injectionReminders: true,
        expirationAlerts: true,
        weeklyReports: true,
        priceAlerts: false
    });

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy & Data', icon: Shield }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Settings</h1>
                <p className={styles.subtitle}>Manage your account and preferences</p>
            </div>

            <div className={styles.layout}>
                <div className={styles.sidebar}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={20} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className={styles.content}>
                    {activeTab === 'profile' && (
                        <div className={styles.section}>
                            <h2>Profile Information</h2>

                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input type="text" placeholder="John Doe" defaultValue="Trevor" />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <div className={styles.inputWithIcon}>
                                    <Mail size={18} />
                                    <input type="email" placeholder="your@email.com" defaultValue="trevor@example.com" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Age (Optional)</label>
                                <input type="number" placeholder="30" />
                                <span className={styles.hint}>Used for personalized recommendations</span>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Gender (Optional)</label>
                                <select>
                                    <option value="">Prefer not to say</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Weight Goal</label>
                                <select>
                                    <option value="weight-loss">Weight Loss</option>
                                    <option value="muscle-gain">Muscle Gain</option>
                                    <option value="recovery">Recovery & Healing</option>
                                    <option value="anti-aging">Anti-Aging</option>
                                    <option value="performance">Performance Enhancement</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <button className="btn-primary">Save Changes</button>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className={styles.section}>
                            <h2>Security Settings</h2>

                            <div className={`card ${styles.infoCard}`}>
                                <Lock size={24} />
                                <div>
                                    <h3>Password</h3>
                                    <p>Last changed 30 days ago</p>
                                </div>
                                <button className={styles.secondaryBtn}>Change Password</button>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Current Password</label>
                                <input type="password" placeholder="Enter current password" />
                            </div>

                            <div className={styles.formGroup}>
                                <label>New Password</label>
                                <input type="password" placeholder="Enter new password" />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Confirm New Password</label>
                                <input type="password" placeholder="Confirm new password" />
                            </div>

                            <div className={styles.divider}></div>

                            <h3>Two-Factor Authentication</h3>
                            <div className={`card ${styles.infoCard}`}>
                                <Shield size={24} />
                                <div>
                                    <h3>2FA Status</h3>
                                    <p className={styles.statusInactive}>Not Enabled</p>
                                </div>
                                <button className={styles.secondaryBtn}>Enable 2FA</button>
                            </div>

                            <div className={styles.divider}></div>

                            <h3>Active Sessions</h3>
                            <div className={`card ${styles.sessionCard}`}>
                                <div>
                                    <h4>Current Device</h4>
                                    <p>MacBook Pro • Chrome • San Francisco, CA</p>
                                    <span className={styles.timestamp}>Active now</span>
                                </div>
                            </div>

                            <button className={styles.dangerBtn}>Sign Out All Devices</button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className={styles.section}>
                            <h2>Notification Preferences</h2>

                            <div className={styles.toggleGroup}>
                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3>Injection Reminders</h3>
                                        <p>Get notified when it's time for your next injection</p>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={notifications.injectionReminders}
                                            onChange={(e) => setNotifications({ ...notifications, injectionReminders: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3>Expiration Alerts</h3>
                                        <p>Warnings when reconstituted peptides are expiring</p>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={notifications.expirationAlerts}
                                            onChange={(e) => setNotifications({ ...notifications, expirationAlerts: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3>Weekly Reports</h3>
                                        <p>Summary of your progress and insights</p>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={notifications.weeklyReports}
                                            onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3>Price Alerts</h3>
                                        <p>Notify when peptide prices drop significantly</p>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={notifications.priceAlerts}
                                            onChange={(e) => setNotifications({ ...notifications, priceAlerts: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>

                            <div className={styles.divider}></div>

                            <h3>Appearance</h3>
                            <div className={styles.toggleItem}>
                                <div>
                                    <h3>Dark Mode</h3>
                                    <p>Use dark theme across the app</p>
                                </div>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={darkMode}
                                        onChange={(e) => setDarkMode(e.target.checked)}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>

                            <button className="btn-primary">Save Preferences</button>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className={styles.section}>
                            <h2>Privacy & Data Management</h2>

                            <div className={`card ${styles.infoCard}`}>
                                <Shield size={24} />
                                <div>
                                    <h3>Data Encryption</h3>
                                    <p>All your data is encrypted end-to-end</p>
                                </div>
                                <span className={styles.statusActive}>Active</span>
                            </div>

                            <div className={styles.divider}></div>

                            <h3>Export Your Data</h3>
                            <p className={styles.description}>
                                Download a copy of all your data in JSON format. This includes injection logs,
                                schedules, and all personal information.
                            </p>
                            <button className={styles.secondaryBtn}>
                                <Download size={18} />
                                Export Data
                            </button>

                            <div className={styles.divider}></div>

                            <h3>Privacy Settings</h3>
                            <div className={styles.toggleGroup}>
                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3>Anonymous Analytics</h3>
                                        <p>Help us improve by sharing anonymized usage data</p>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input type="checkbox" defaultChecked />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3>Marketing Emails</h3>
                                        <p>Receive updates about new features and tips</p>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input type="checkbox" />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>

                            <div className={styles.divider}></div>

                            <h3>Legal Documents</h3>
                            <div className={styles.linkGroup}>
                                <a href="/terms" className={styles.link}>Terms of Service</a>
                                <a href="/privacy" className={styles.link}>Privacy Policy</a>
                                <a href="/disclaimer" className={styles.link}>Medical Disclaimer</a>
                            </div>

                            <div className={styles.divider}></div>

                            <h3 className={styles.dangerZone}>Danger Zone</h3>
                            <div className={`card ${styles.dangerCard}`}>
                                <Trash2 size={24} />
                                <div>
                                    <h3>Delete Account</h3>
                                    <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                                </div>
                                <button className={styles.dangerBtn}>Delete Account</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
