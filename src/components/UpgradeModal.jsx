import React, { useState } from 'react';
import { X, Check, Star, Zap, Shield } from 'lucide-react';
import { paymentService, SUBSCRIPTION_TIERS } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import styles from './UpgradeModal.module.css';

const UpgradeModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [loadingTier, setLoadingTier] = useState(null);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleUpgrade = async (tierId) => {
        setLoadingTier(tierId);
        setError(null);
        try {
            const result = await paymentService.createCheckoutSession(user.id, tierId);
            if (!result.success && !result.redirecting) {
                setError(result.message || 'Failed to start checkout');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            // Don't clear loading if redirecting, as the page will unload
            if (!window.location.href.includes('checkout.stripe.com')) {
                setLoadingTier(null);
            }
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>

                <div className={styles.header}>
                    <h2>Unlock Full Access</h2>
                    <p>Take your research to the next level with premium features</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <div className={styles.plans}>
                    {/* Premium Plan */}
                    <div className={styles.planCard}>
                        <div className={styles.planHeader}>
                            <h3>Premium</h3>
                            <div className={styles.price}>
                                <span className={styles.currency}>$</span>
                                <span className={styles.amount}>{SUBSCRIPTION_TIERS.PREMIUM.price}</span>
                                <span className={styles.period}>/mo</span>
                            </div>
                        </div>
                        <ul className={styles.features}>
                            {SUBSCRIPTION_TIERS.PREMIUM.features.map((feature, i) => (
                                <li key={i}><Check size={16} /> {feature}</li>
                            ))}
                        </ul>
                        <button
                            className={styles.planBtn}
                            onClick={() => handleUpgrade('premium')}
                            disabled={loadingTier !== null}
                        >
                            {loadingTier === 'premium' ? 'Processing...' : 'Choose Premium'}
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className={`${styles.planCard} ${styles.popular}`}>
                        <div className={styles.popularBadge}>Most Popular</div>
                        <div className={styles.planHeader}>
                            <h3>Pro</h3>
                            <div className={styles.price}>
                                <span className={styles.currency}>$</span>
                                <span className={styles.amount}>{SUBSCRIPTION_TIERS.PRO.price}</span>
                                <span className={styles.period}>/mo</span>
                            </div>
                        </div>
                        <ul className={styles.features}>
                            {SUBSCRIPTION_TIERS.PRO.features.map((feature, i) => (
                                <li key={i}><Check size={16} /> {feature}</li>
                            ))}
                        </ul>
                        <button
                            className={`${styles.planBtn} ${styles.primaryBtn}`}
                            onClick={() => handleUpgrade('pro')}
                            disabled={loadingTier !== null}
                        >
                            {loadingTier === 'pro' ? 'Processing...' : 'Choose Pro'}
                        </button>
                    </div>
                </div>

                <p className={styles.guarantee}>
                    <Shield size={14} /> Secure payment via Stripe. Cancel anytime.
                </p>
            </div>
        </div>
    );
};

export default UpgradeModal;
