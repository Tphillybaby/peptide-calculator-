import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import styles from './EmailCapture.module.css';

/**
 * EmailCapture — newsletter opt-in banner for non-logged-in users.
 * Stores subscribers in the email_subscribers Supabase table.
 * Only renders for guests (hides for authenticated users).
 */
const EmailCapture = ({ source = 'website', variant = 'banner' }) => {
    const { user } = useAuth();
    const [email, setEmail]       = useState('');
    const [status, setStatus]     = useState('idle'); // idle | loading | success | error
    const [message, setMessage]   = useState('');

    // Don't show to logged-in users
    if (user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || status === 'loading') return;

        setStatus('loading');
        setMessage('');

        try {
            const { error } = await supabase
                .from('email_subscribers')
                .insert({ email: email.trim().toLowerCase(), source });

            if (error) {
                if (error.code === '23505') {
                    // Unique constraint — already subscribed
                    setStatus('success');
                    setMessage("You're already on the list!");
                } else {
                    throw error;
                }
            } else {
                setStatus('success');
                setMessage('');
            }
        } catch (err) {
            console.error('[EmailCapture] Subscribe error:', err);
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <div className={`${styles.container} ${styles[variant]}`}>
                <div className={styles.successState}>
                    <CheckCircle size={28} className={styles.successIcon} />
                    <div>
                        <p className={styles.successTitle}>You're in! 🎉</p>
                        <p className={styles.successSub}>
                            {message || "We'll notify you when new peptides and guides drop."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${styles[variant]}`}>
            <div className={styles.inner}>
                <div className={styles.iconWrap}>
                    <Sparkles size={22} />
                </div>
                <div className={styles.textBlock}>
                    <p className={styles.heading}>Stay up to date</p>
                    <p className={styles.sub}>
                        Get notified when we add new peptides, guides, and tools.
                    </p>
                </div>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input
                        id="email-capture-input"
                        type="email"
                        className={styles.input}
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={status === 'loading'}
                        aria-label="Email address"
                    />
                    <button
                        type="submit"
                        className={styles.btn}
                        disabled={status === 'loading' || !email.trim()}
                        id="email-capture-submit"
                        aria-label="Subscribe to updates"
                    >
                        {status === 'loading' ? (
                            <span className={styles.spinner} />
                        ) : (
                            <>
                                <span>Subscribe</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
                {status === 'error' && (
                    <p className={styles.errorMsg}>{message}</p>
                )}
            </div>
        </div>
    );
};

export default EmailCapture;
