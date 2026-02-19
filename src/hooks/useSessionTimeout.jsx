import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Session Timeout Hook
 * Warns users before session expires and handles auto-logout
 * 
 * @param {Object} options
 * @param {number} options.timeoutMinutes - Session timeout in minutes (default: 60)
 * @param {number} options.warningMinutes - Warning before timeout in minutes (default: 5)
 */
export const useSessionTimeout = (options = {}) => {
    const {
        timeoutMinutes = 60,
        warningMinutes = 5
    } = options;

    const { user, signOut } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);
    const countdownRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = warningMinutes * 60 * 1000;

    const resetTimers = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);

        // Clear existing timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        if (!user) return;

        // Set warning timer
        warningRef.current = setTimeout(() => {
            setShowWarning(true);
            setRemainingTime(warningMs / 1000);

            // Start countdown
            countdownRef.current = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, timeoutMs - warningMs);

        // Set logout timer
        timeoutRef.current = setTimeout(() => {
            signOut();
        }, timeoutMs);
    }, [user, signOut, timeoutMs, warningMs]);

    const extendSession = useCallback(() => {
        resetTimers();
    }, [resetTimers]);

    const dismissWarning = useCallback(() => {
        setShowWarning(false);
        resetTimers();
    }, [resetTimers]);

    // Set up activity listeners
    useEffect(() => {
        if (!user) {
            setShowWarning(false);
            return;
        }

        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            // Debounce activity tracking
            const now = Date.now();
            if (now - lastActivityRef.current > 30000) { // Only reset if 30s since last activity
                resetTimers();
            }
        };

        activityEvents.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // Initial timer setup
        resetTimers();

        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [user, resetTimers]);

    // Format remaining time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        showWarning,
        remainingTime,
        remainingTimeFormatted: formatTime(remainingTime),
        extendSession,
        dismissWarning
    };
};

/**
 * Session Timeout Warning Component
 */
export const SessionTimeoutWarning = () => {
    const { showWarning, remainingTimeFormatted, extendSession, dismissWarning } = useSessionTimeout();

    if (!showWarning) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease'
        }}>
            <div style={{
                background: 'var(--glass-bg, rgba(26, 31, 53, 0.95))',
                border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.1))',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    fontSize: '1.5rem'
                }}>
                    ⏰
                </div>

                <h3 style={{
                    margin: '0 0 0.5rem',
                    fontSize: '1.25rem',
                    color: 'var(--text-primary, #f8fafc)'
                }}>
                    Session Expiring Soon
                </h3>

                <p style={{
                    color: 'var(--text-secondary, #94a3b8)',
                    marginBottom: '1rem',
                    lineHeight: '1.6'
                }}>
                    Your session will expire in <strong style={{ color: '#f59e0b' }}>{remainingTimeFormatted}</strong> due to inactivity.
                </p>

                <p style={{
                    color: 'var(--text-tertiary, #64748b)',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem'
                }}>
                    Would you like to stay logged in?
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button
                        onClick={extendSession}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '9999px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.9375rem'
                        }}
                    >
                        Stay Logged In
                    </button>
                    <button
                        onClick={dismissWarning}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-secondary, #94a3b8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '9999px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontSize: '0.9375rem'
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default useSessionTimeout;
