import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Database, Save, LogOut, AlertTriangle, Loader, Lock, Mail, Download, Trash2, Star, MessageSquare, ExternalLink, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { notificationService } from '../services/notificationService';
import { emailService } from '../services/emailService';
import { getUserReviews, deleteReview } from '../services/reviewService';
import styles from './Settings.module.css';

const Settings = () => {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');

    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        age: '',
        gender: 'prefer-not-to-say',
        weight_goal: 'weight-loss'
    });

    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState({
        injectionReminders: true,
        expirationAlerts: true,
        weeklyReports: true,
        priceAlerts: false
    });

    const [userReviews, setUserReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchUserReviews();
        }
    }, [user]);

    const fetchUserReviews = async () => {
        if (!user) return;
        setReviewsLoading(true);
        try {
            const reviews = await getUserReviews(user.id);
            setUserReviews(reviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        const success = await deleteReview(reviewId);
        if (success) {
            setUserReviews(userReviews.filter(r => r.id !== reviewId));
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    email: user.email,
                    age: data.age || '',
                    gender: data.gender || 'prefer-not-to-say',
                    weight_goal: data.weight_goal || 'weight-loss'
                });
            } else {
                // Initialize with email if no profile exists
                setProfile(prev => ({ ...prev, email: user.email }));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async () => {
        try {
            setSaving(true);
            setMessage(null);

            const updates = {
                id: user.id,
                full_name: profile.full_name,
                updated_at: new Date().toISOString()
                // Add other fields to schema.sql if you want to persist them
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Settings saved successfully' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'activity', label: 'Activity', icon: Activity },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy & Data', icon: Shield }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader className="animate-spin" size={32} />
            </div>
        );
    }

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
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <div className={styles.inputWithIcon}>
                                    <Mail size={18} />
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className={styles.disabledInput}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Age (Optional)</label>
                                <input
                                    type="number"
                                    placeholder="30"
                                    value={profile.age}
                                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                                />
                                <span className={styles.hint}>Used for personalized recommendations</span>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Gender (Optional)</label>
                                <select
                                    value={profile.gender}
                                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                >
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Weight Goal</label>
                                <select
                                    value={profile.weight_goal}
                                    onChange={(e) => setProfile({ ...profile, weight_goal: e.target.value })}
                                >
                                    <option value="weight-loss">Weight Loss</option>
                                    <option value="muscle-gain">Muscle Gain</option>
                                    <option value="recovery">Recovery & Healing</option>
                                    <option value="anti-aging">Anti-Aging</option>
                                    <option value="performance">Performance Enhancement</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {message && (
                                <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1rem', padding: '10px', borderRadius: '8px', background: message.type === 'error' ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)', color: message.type === 'error' ? '#ff4d4d' : '#4dff4d' }}>
                                    {message.text}
                                </div>
                            )}
                            <button className="btn-primary" onClick={updateProfile} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className={styles.section}>
                            <h2>Your Activity</h2>
                            <p className={styles.subtitle} style={{ marginBottom: '1.5rem' }}>View your reviews, ratings, and contributions</p>

                            {/* Reviews Section */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <MessageSquare size={20} color="var(--accent-primary)" />
                                    Your Reviews ({userReviews.length})
                                </h3>

                                {reviewsLoading ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <Loader className="animate-spin" size={24} />
                                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Loading reviews...</p>
                                    </div>
                                ) : userReviews.length === 0 ? (
                                    <div style={{
                                        padding: '2rem',
                                        textAlign: 'center',
                                        background: 'rgba(15, 23, 42, 0.3)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        <MessageSquare size={32} color="var(--text-tertiary)" style={{ marginBottom: '0.5rem' }} />
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No reviews yet</p>
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                            Share your experience with peptides by leaving reviews on their detail pages.
                                        </p>
                                        <Link to="/encyclopedia" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                                            Browse Peptides
                                        </Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {userReviews.map((review) => (
                                            <div
                                                key={review.id}
                                                className="card glass-panel"
                                                style={{
                                                    padding: '1.25rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.75rem'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <Link
                                                            to={`/encyclopedia/${encodeURIComponent(review.peptide_name)}`}
                                                            style={{
                                                                fontSize: '1.1rem',
                                                                fontWeight: '600',
                                                                color: 'var(--accent-primary)',
                                                                textDecoration: 'none',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem'
                                                            }}
                                                        >
                                                            {review.peptide_name}
                                                            <ExternalLink size={14} />
                                                        </Link>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        size={14}
                                                                        fill={star <= review.rating ? '#fbbf24' : 'none'}
                                                                        color={star <= review.rating ? '#fbbf24' : '#4b5563'}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                                                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                                            borderRadius: '6px',
                                                            padding: '0.5rem',
                                                            cursor: 'pointer',
                                                            color: '#ef4444',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title="Delete review"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                {review.comment && (
                                                    <p style={{
                                                        color: 'var(--text-secondary)',
                                                        fontSize: '0.9rem',
                                                        lineHeight: '1.5',
                                                        margin: 0
                                                    }}>
                                                        "{review.comment}"
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.divider}></div>

                            {/* Stats Overview */}
                            <h3 style={{ marginBottom: '1rem' }}>Activity Summary</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '1rem'
                            }}>
                                <div className="card glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                                        {userReviews.length}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Reviews Written</div>
                                </div>
                                <div className="card glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fbbf24' }}>
                                        {userReviews.length > 0
                                            ? (userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length).toFixed(1)
                                            : '—'}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Avg Rating Given</div>
                                </div>
                                <div className="card glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
                                        {new Set(userReviews.map(r => r.peptide_name)).size}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Peptides Reviewed</div>
                                </div>
                            </div>
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

                            <button className={styles.dangerBtn} onClick={signOut}>Sign Out All Devices</button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className={styles.section}>
                            <h2>Notification Preferences</h2>

                            <div className={styles.toggleGroup}>
                                <div className={styles.settingItem}>
                                    <div className={styles.settingInfo}>
                                        <span className={styles.settingLabel}>Injection Reminders</span>
                                        <span className={styles.settingDescription}>Get notified when it's time for your next dose</span>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={notifications.email_reminders}
                                            onChange={async (e) => {
                                                if (e.target.checked) {
                                                    const granted = await notificationService.requestPermission();
                                                    if (granted) {
                                                        setNotifications({ ...notifications, email_reminders: true });
                                                        notificationService.sendNotification('Reminders Enabled', { body: 'You will now receive injection reminders.' });
                                                    } else {
                                                        alert('Please enable notifications in your browser settings.');
                                                    }
                                                } else {
                                                    setNotifications({ ...notifications, email_reminders: false });
                                                }
                                            }}
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
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>

                            <div style={{ marginLeft: '3rem', marginBottom: '1.5rem' }}>
                                <button
                                    className={styles.secondaryBtn}
                                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                    onClick={async () => {
                                        if (confirm('Send a test reminder email to ' + user.email + '?')) {
                                            await emailService.sendTestReminder(user.email);
                                            alert('Test email sent! (Check console for simulation)');
                                        }
                                    }}
                                >
                                    Send Test Email
                                </button>
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
