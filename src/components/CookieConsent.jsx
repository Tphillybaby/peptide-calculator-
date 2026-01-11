import React, { useState, useEffect } from 'react';
import { Cookie, Settings, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState({
        necessary: true, // Always required
        analytics: true,
        functional: true,
        marketing: false
    });

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        } else {
            try {
                const savedPrefs = JSON.parse(consent);
                setPreferences(savedPrefs);
            } catch (e) {
                // Legacy format, accept all
            }
        }
    }, []);

    const handleAcceptAll = () => {
        const allAccepted = {
            necessary: true,
            analytics: true,
            functional: true,
            marketing: true
        };
        localStorage.setItem('cookie_consent', JSON.stringify(allAccepted));
        localStorage.setItem('cookie_consent_date', new Date().toISOString());
        setPreferences(allAccepted);
        setIsVisible(false);
        applyConsent(allAccepted);
    };

    const handleRejectAll = () => {
        const onlyNecessary = {
            necessary: true,
            analytics: false,
            functional: false,
            marketing: false
        };
        localStorage.setItem('cookie_consent', JSON.stringify(onlyNecessary));
        localStorage.setItem('cookie_consent_date', new Date().toISOString());
        setPreferences(onlyNecessary);
        setIsVisible(false);
        applyConsent(onlyNecessary);
    };

    const handleSavePreferences = () => {
        localStorage.setItem('cookie_consent', JSON.stringify(preferences));
        localStorage.setItem('cookie_consent_date', new Date().toISOString());
        setIsVisible(false);
        applyConsent(preferences);
    };

    const applyConsent = (prefs) => {
        // Disable/enable analytics based on consent
        if (!prefs.analytics) {
            // Disable Google Analytics
            window['ga-disable-GA_MEASUREMENT_ID'] = true;
        }
        // Additional consent-based logic can be added here
    };

    const togglePreference = (key) => {
        if (key === 'necessary') return; // Can't disable necessary cookies
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            maxWidth: '520px',
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            zIndex: 9999,
            boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.5)',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                    padding: '0.5rem',
                    background: 'rgba(59, 130, 246, 0.15)',
                    borderRadius: '50%',
                    color: '#3b82f6'
                }}>
                    <Cookie size={22} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Cookie Preferences</h3>
            </div>

            {!showSettings ? (
                <>
                    {/* Main Content */}
                    <p style={{
                        margin: '0 0 1rem 0',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6'
                    }}>
                        We use cookies to enhance your experience, analyze site traffic, and personalize content.
                        You can choose to accept all cookies, reject non-essential cookies, or customize your preferences.
                    </p>

                    <p style={{
                        margin: '0 0 1.25rem 0',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)'
                    }}>
                        Read our <Link to="/privacy" style={{ color: 'var(--accent-primary)' }}>Privacy Policy</Link> for more details.
                    </p>

                    {/* Buttons */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <button
                            onClick={handleRejectAll}
                            style={{
                                flex: '1 1 auto',
                                padding: '0.625rem 1rem',
                                fontSize: '0.875rem',
                                background: 'transparent',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <X size={16} />
                            Reject All
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            style={{
                                flex: '1 1 auto',
                                padding: '0.625rem 1rem',
                                fontSize: '0.875rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Settings size={16} />
                            Customize
                        </button>
                        <button
                            onClick={handleAcceptAll}
                            className="btn-primary"
                            style={{
                                flex: '1 1 100%',
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Check size={16} />
                            Accept All
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Settings Panel */}
                    <div style={{ marginBottom: '1rem' }}>
                        {[
                            {
                                key: 'necessary',
                                label: 'Strictly Necessary',
                                description: 'Required for the website to function. Cannot be disabled.',
                                required: true
                            },
                            {
                                key: 'functional',
                                label: 'Functional',
                                description: 'Remember your preferences and settings.'
                            },
                            {
                                key: 'analytics',
                                label: 'Analytics',
                                description: 'Help us understand how visitors use our site.'
                            },
                            {
                                key: 'marketing',
                                label: 'Marketing',
                                description: 'Used to deliver relevant advertisements.'
                            }
                        ].map(({ key, label, description, required }) => (
                            <div
                                key={key}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'var(--text-primary)',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {label}
                                        {required && (
                                            <span style={{
                                                marginLeft: '0.5rem',
                                                fontSize: '0.7rem',
                                                color: 'var(--text-secondary)',
                                                background: 'rgba(255,255,255,0.1)',
                                                padding: '0.125rem 0.375rem',
                                                borderRadius: '4px'
                                            }}>
                                                Required
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {description}
                                    </div>
                                </div>
                                <button
                                    onClick={() => togglePreference(key)}
                                    disabled={required}
                                    style={{
                                        width: '48px',
                                        height: '26px',
                                        borderRadius: '13px',
                                        border: 'none',
                                        cursor: required ? 'not-allowed' : 'pointer',
                                        background: preferences[key] ? '#10b981' : 'rgba(255,255,255,0.15)',
                                        position: 'relative',
                                        transition: 'background 0.2s',
                                        opacity: required ? 0.7 : 1
                                    }}
                                >
                                    <span style={{
                                        position: 'absolute',
                                        top: '3px',
                                        left: preferences[key] ? '25px' : '3px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        transition: 'left 0.2s',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Settings Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => setShowSettings(false)}
                            style={{
                                flex: 1,
                                padding: '0.625rem 1rem',
                                fontSize: '0.875rem',
                                background: 'transparent',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSavePreferences}
                            className="btn-primary"
                            style={{
                                flex: 1,
                                padding: '0.625rem 1.5rem',
                                fontSize: '0.875rem'
                            }}
                        >
                            Save Preferences
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CookieConsent;
