import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';
import {
    Home,
    Search,
    BookOpen,
    Calculator,
    Beaker,
    Shield,
    ArrowLeft,
    HelpCircle
} from 'lucide-react';

const popularLinks = [
    { to: '/', label: 'Dashboard', icon: Home, description: 'Return to your home screen' },
    { to: '/encyclopedia', label: 'Peptide Encyclopedia', icon: BookOpen, description: 'Browse all peptides' },
    { to: '/calculator', label: 'Reconstitution Calculator', icon: Calculator, description: 'Calculate your dosing' },
    { to: '/guides', label: 'Guides & Tutorials', icon: HelpCircle, description: 'Learn peptide protocols' },
    { to: '/safety', label: 'Safety & Storage', icon: Shield, description: 'Proper handling practices' },
    { to: '/price-checker', label: 'Price Checker', icon: Search, description: 'Compare peptide prices' },
];

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        trackEvent('error', '404_not_found', location.pathname);
    }, [location]);

    return (
        <div style={{
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem',
            textAlign: 'center'
        }}>
            {/* Animated 404 Icon */}
            <div style={{
                position: 'relative',
                marginBottom: '2rem'
            }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                    border: '2px solid rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    animation: 'float404 3s ease-in-out infinite'
                }}>
                    <Beaker size={48} color="var(--accent-primary)" style={{ opacity: 0.8 }} />
                </div>
            </div>

            {/* Error Details */}
            <h1 style={{
                fontSize: 'clamp(3rem, 8vw, 5rem)',
                fontWeight: '800',
                margin: '0 0 0.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1
            }}>
                404
            </h1>

            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: '0 0 0.75rem'
            }}>
                Page Not Found
            </h2>

            <p style={{
                color: 'var(--text-secondary)',
                maxWidth: '460px',
                lineHeight: '1.6',
                marginBottom: '0.5rem'
            }}>
                The page you're looking for doesn't exist or has been moved.
                This might happen if a peptide was renamed or a link is outdated.
            </p>

            <p style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.8rem',
                marginBottom: '2rem',
                fontFamily: 'monospace',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--glass-border)'
            }}>
                {location.pathname}
            </p>

            {/* Quick Actions */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '2.5rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <Link
                    to="/"
                    className="btn-primary"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textDecoration: 'none'
                    }}
                >
                    <Home size={18} />
                    Go Home
                </Link>
                <button
                    onClick={() => window.history.back()}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <ArrowLeft size={18} />
                    Go Back
                </button>
            </div>

            {/* Popular Pages */}
            <div style={{ width: '100%', maxWidth: '700px' }}>
                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Popular Pages
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.75rem'
                }}>
                    {/* eslint-disable-next-line no-unused-vars */}
                    {popularLinks.map(({ to, label, icon: Icon, description }) => (
                        <Link
                            key={to}
                            to={to}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--glass-bg)',
                                textDecoration: 'none',
                                color: 'var(--text-primary)',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Icon size={18} color="var(--accent-primary)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{label}</div>
                                <div style={{
                                    color: 'var(--text-tertiary)',
                                    fontSize: '0.75rem',
                                    marginTop: '2px'
                                }}>
                                    {description}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Float animation */}
            <style>{`
                @keyframes float404 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
};

export default NotFound;
