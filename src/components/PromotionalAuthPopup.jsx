import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './PromotionalAuthPopup.module.css';

const PromotionalAuthPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { user, loading, hasAccount, authReady } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Don't show if loading, logged in, or previously dismissed
        if (loading || authReady === false || user || hasAccount) {
            setIsVisible(false);
            return;
        }

        const checkDismissal = () => {
            const dismissedAt = localStorage.getItem('auth_popup_dismissed');
            if (dismissedAt) {
                const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
                if (daysSince < 7) return; // Don't show for 7 days after dismissal
            }

            // Show after 15 seconds of browsing
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 15000);

            return () => clearTimeout(timer);
        };

        return checkDismissal();
    }, [user, loading, hasAccount, authReady]);

    const handleClose = (e) => {
        if (e) e.stopPropagation();
        setIsVisible(false);
        localStorage.setItem('auth_popup_dismissed', Date.now().toString());
    };

    const handleNavigate = (path) => {
        setIsVisible(false);
        navigate(path);
    };

    if (loading || authReady === false || user || hasAccount || !isVisible) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={handleClose}>
                    <X size={20} />
                </button>

                <div className={styles.content}>
                    <div className={styles.iconWrapper}>
                        <Users size={32} />
                    </div>

                    <h2 className={styles.title}>Join the Community</h2>
                    <p className={styles.description}>
                        Track your peptide protocols, share reviews, and discuss with thousands of other researchers.
                        Create a free account to unlock full access.
                    </p>

                    <div className={styles.actions}>
                        <button
                            className={styles.signupBtn}
                            onClick={() => handleNavigate('/signup')}
                        >
                            Create Free Account <ArrowRight size={18} />
                        </button>
                        <button
                            className={styles.loginBtn}
                            onClick={() => handleNavigate('/login')}
                        >
                            <LogIn size={18} /> Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionalAuthPopup;
