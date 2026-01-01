import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(false);
    const [error, setError] = useState(null);
    const [needs2FA, setNeeds2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [factorId, setFactorId] = useState(null);
    const { signIn, signInWithOAuth, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the page user was trying to access before being redirected to login
    const from = location.state?.from?.pathname || '/settings';

    // Handle redirection and AAL checks
    useEffect(() => {
        const checkAuthAndRedirect = async () => {
            if (user) {
                // If we are already verifying 2FA, don't redirect
                if (needs2FA) return;

                // Check MFA requirement
                const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

                if (mfaData && mfaData.nextLevel === 'aal2' && mfaData.currentLevel === 'aal1') {
                    // 2FA required
                    setNeeds2FA(true);

                    // Fetch factors to get the TOTP ID
                    const { data: factors } = await supabase.auth.mfa.listFactors();
                    const totp = factors?.all?.find(f => f.factor_type === 'totp');
                    if (totp) {
                        setFactorId(totp.id);
                    } else {
                        setError('2FA required but no factor found. Please contact support.');
                    }
                } else {
                    // No 2FA needed, redirect
                    navigate(from, { replace: true });
                }
            }
        };

        checkAuthAndRedirect();
    }, [user, needs2FA, navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signIn(email, password);
            // useEffect will handle the rest (MFA check or redirect)
        } catch (err) {
            // Make error messages more user-friendly
            if (err.message.includes('Invalid login credentials')) {
                setError('Invalid email or password. Please try again.');
            } else if (err.message.includes('Email not confirmed')) {
                setError('Please check your email and confirm your account before logging in.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handle2FAVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!factorId) throw new Error('2FA factor ID not found');

            const challenge = await supabase.auth.mfa.challenge({ factorId });
            if (challenge.error) throw challenge.error;

            const verify = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challenge.data.id,
                code: twoFactorCode
            });

            if (verify.error) throw verify.error;

            // Success, navigate
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setOauthLoading(true);
        setError(null);
        try {
            await signInWithOAuth('google');
            // OAuth redirects, so we don't need to do anything here
        } catch (err) {
            setError('Failed to sign in with Google. Please try again.');
            setOauthLoading(false);
        }
    };

    const inputStyle = {
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        width: '100%',
        boxSizing: 'border-box'
    };

    const oauthButtonStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        fontWeight: '500',
        cursor: oauthLoading ? 'not-allowed' : 'pointer',
        opacity: oauthLoading ? 0.7 : 1,
        transition: 'all 0.2s'
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh'
        }}>
            <div className="card glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        background: 'var(--accent-glow)',
                        padding: '1rem',
                        borderRadius: '50%',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {needs2FA ? <Shield size={32} color="var(--accent-primary)" /> : <LogIn size={32} color="var(--accent-primary)" />}
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>{needs2FA ? 'Two-Factor Authentication' : 'Welcome Back'}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{needs2FA ? 'Enter the code from your authenticator app' : 'Sign in to your account'}</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                    }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {needs2FA ? (
                    <form onSubmit={handle2FAVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Verification Code</label>
                            <input
                                type="text"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.25rem', fontSize: '1.25rem' }}
                                required
                                autoFocus
                                maxLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || twoFactorCode.length !== 6}
                            style={{
                                marginTop: '0.5rem',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: loading || twoFactorCode.length !== 6 ? 0.7 : 1,
                                cursor: loading || twoFactorCode.length !== 6 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
                            {!loading && <Shield size={18} />}
                        </button>

                        <button
                            type="button"
                            onClick={() => setNeeds2FA(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-tertiary)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                textDecoration: 'underline'
                            }}
                        >
                            Cancel and go back
                        </button>
                    </form>
                ) : (
                    <>
                        {/* OAuth Buttons */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <button
                                onClick={handleGoogleLogin}
                                disabled={oauthLoading}
                                style={oauthButtonStyle}
                                onMouseEnter={(e) => {
                                    if (!oauthLoading) e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                {oauthLoading ? 'Connecting...' : 'Continue with Google'}
                            </button>
                        </div>

                        {/* Divider */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>or</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    style={inputStyle}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Password</label>
                                    <Link
                                        to="/forgot-password"
                                        style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--accent-primary)',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        style={{
                                            ...inputStyle,
                                            paddingRight: '3rem'
                                        }}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '0.75rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-tertiary)'
                                        }}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                                style={{
                                    marginTop: '0.5rem',
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                                {!loading && <LogIn size={18} />}
                            </button>
                        </form>
                    </>
                )}

                <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--glass-border)',
                    textAlign: 'center'
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            style={{
                                color: 'var(--accent-primary)',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div >
        </div >
    );
};

export default Login;
