import React, { useState } from 'react';
import { Send, Mail, MessageSquare, CheckCircle, AlertCircle, HelpCircle, Bug, Lightbulb, CreditCard, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { emailService } from '../services/emailService';
import styles from './Contact.module.css';

const CATEGORIES = [
    { id: 'general', label: 'General Inquiry', icon: HelpCircle, color: '#3b82f6' },
    { id: 'bug', label: 'Bug Report', icon: Bug, color: '#ef4444' },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: '#f59e0b' },
    { id: 'account', label: 'Account Issue', icon: AlertCircle, color: '#8b5cf6' },
    { id: 'billing', label: 'Billing', icon: CreditCard, color: '#10b981' },
];

const Contact = () => {
    const { user } = useAuth();

    const [form, setForm] = useState({
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        category: 'general',
        subject: '',
        message: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            setSubmitting(true);

            if (user) {
                // Logged-in user: create a support ticket in the database
                const { error: ticketError } = await supabase
                    .from('support_tickets')
                    .insert({
                        user_id: user.id,
                        subject: form.subject,
                        description: `[Contact Form]\n\nFrom: ${form.name} (${form.email})\nCategory: ${form.category}\n\n${form.message}`,
                        category: form.category,
                        priority: 'normal'
                    });

                if (ticketError) throw ticketError;
            }

            // Send notification email to admin (works for both guests and logged-in users)
            await emailService.sendCustomEmail('contact_form', 'support@peptidelog.net', {
                name: form.name,
                email: form.email,
                category: CATEGORIES.find(c => c.id === form.category)?.label || form.category,
                subject: form.subject,
                message: form.message,
                isLoggedIn: !!user
            });

            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting contact form:', err);
            setError('Something went wrong. Please try again or email us directly at support@peptidelog.net');
        } finally {
            setSubmitting(false);
        }
    };

    // Success state
    if (submitted) {
        return (
            <div className={styles.container}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>
                        <CheckCircle size={48} />
                    </div>
                    <h2>Message Sent!</h2>
                    <p>Thank you for reaching out. We typically respond within 24 hours.</p>
                    <p className={styles.successDetail}>
                        A confirmation has been sent to <strong>{form.email}</strong>
                    </p>
                    <div className={styles.successActions}>
                        <button
                            className={styles.primaryBtn}
                            onClick={() => {
                                setSubmitted(false);
                                setForm({
                                    name: user?.user_metadata?.full_name || '',
                                    email: user?.email || '',
                                    category: 'general',
                                    subject: '',
                                    message: ''
                                });
                            }}
                        >
                            Send Another Message
                        </button>
                        <a href="/" className={styles.secondaryBtn}>
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <Mail size={32} />
                </div>
                <h1>Contact Us</h1>
                <p>Have a question, feedback, or need help? We'd love to hear from you.</p>
            </div>

            <div className={styles.layout}>
                {/* Contact Form */}
                <div className={styles.formCard}>
                    <form onSubmit={handleSubmit}>
                        {/* Category selector */}
                        <div className={styles.categorySection}>
                            <label className={styles.label}>What can we help you with?</label>
                            <div className={styles.categoryGrid}>
                                {CATEGORIES.map(cat => {
                                    const Icon = cat.icon;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            className={`${styles.categoryBtn} ${form.category === cat.id ? styles.categoryActive : ''}`}
                                            onClick={() => handleChange('category', cat.id)}
                                            style={{
                                                '--cat-color': cat.color,
                                                '--cat-bg': `${cat.color}15`,
                                                '--cat-border': `${cat.color}30`
                                            }}
                                        >
                                            <Icon size={18} />
                                            <span>{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Name & Email row */}
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Name <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    disabled={!!user?.user_metadata?.full_name}
                                    className={user?.user_metadata?.full_name ? styles.prefilled : ''}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Email <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    disabled={!!user?.email}
                                    className={user?.email ? styles.prefilled : ''}
                                    required
                                />
                            </div>
                        </div>

                        {/* Subject */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Subject <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Brief summary of your inquiry"
                                value={form.subject}
                                onChange={(e) => handleChange('subject', e.target.value)}
                                required
                            />
                        </div>

                        {/* Message */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Message <span className={styles.required}>*</span>
                            </label>
                            <textarea
                                placeholder="Tell us more about how we can help..."
                                value={form.message}
                                onChange={(e) => handleChange('message', e.target.value)}
                                rows={6}
                                required
                            />
                            <span className={styles.charCount}>
                                {form.message.length} / 2000
                            </span>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className={styles.errorMsg}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader size={18} className="animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sidebar info */}
                <div className={styles.sidebar}>
                    <div className={styles.infoCard}>
                        <MessageSquare size={20} />
                        <div>
                            <h3>Response Time</h3>
                            <p>We typically respond within 24 hours during business days.</p>
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <Mail size={20} />
                        <div>
                            <h3>Email Us Directly</h3>
                            <a href="mailto:support@peptidelog.net" className={styles.emailLink}>
                                support@peptidelog.net
                            </a>
                        </div>
                    </div>

                    {!user && (
                        <div className={styles.loginHint}>
                            <p>
                                <a href="/login">Sign in</a> to track your support tickets and get faster responses.
                            </p>
                        </div>
                    )}

                    {user && (
                        <div className={styles.loginHint}>
                            <p>
                                View your ticket history in <a href="/support">Support Tickets</a>.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;
