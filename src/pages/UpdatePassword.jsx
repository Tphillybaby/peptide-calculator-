import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { calculatePasswordStrength } from '../utils/passwordStrength';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isRecovery, setIsRecovery] = useState(false);
    const { updatePassword } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we arrived here via a password recovery link
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecovery(true);
            }
        });

        // Also check URL hash for recovery tokens (Supabase sends them in URL fragment)
        const hash = window.location.hash;
        if (hash && (hash.includes('type=recovery') || hash.includes('type=signup'))) {
            setIsRecovery(true);
        }

        return () => subscription.unsubscribe();
    }, []);

    const passwordStrength = calculatePasswordStrength(password);

    const getStrengthColor = (score) => {
        if (score <= 1) return '#ef4444';
        if (score === 2) return '#f59e0b';
        if (score === 3) return '#3b82f6';
        return '#10b981';
    };

    const getStrengthLabel = (score) => {
        if (score <= 1) return 'Weak';
        if (score === 2) return 'Fair';
        if (score === 3) return 'Good';
        return 'Strong';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (passwordStrength.score < 2) {
            setError('Please choose a stronger password.');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(password);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to update password. Please try again.');
        } finally {
            setLoading(false);
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
        transition: 'border-color 0.2s',
        width: '100%',
        boxSizing: 'border-box'
    };

    if (success) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh'
            }}>
                <div className="card glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', textAlign: 'center' }}>
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '1.25rem',
                        borderRadius: '50%',
                        marginBottom: '1.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CheckCircle size={48} color="#10b981" />
                    </div>
                    <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
                        Password Updated!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        Your password has been successfully updated. You can now log in with your new password.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            Go to Dashboard
                        </button>
                        <Link
                            to="/settings"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            Go to Settings
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh'
        }}>
            <div className="card glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
                <Link
                    to="/login"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to login
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
                        padding: '1rem',
                        borderRadius: '50%',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Shield size={32} color="var(--accent-primary)" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                        {isRecovery ? 'Reset Your Password' : 'Update Password'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
                        {isRecovery
                            ? 'Choose a new, strong password for your account'
                            : 'Enter your new password below'}
                    </p>
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                            New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)'
                            }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '40px' }}
                                required
                                minLength={8}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-tertiary)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password Strength Meter */}
                        {password.length > 0 && (
                            <div style={{ marginTop: '0.25rem' }}>
                                <div style={{
                                    display: 'flex',
                                    gap: '4px',
                                    marginBottom: '0.35rem'
                                }}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            style={{
                                                flex: 1,
                                                height: '4px',
                                                borderRadius: '2px',
                                                background: i <= passwordStrength.score
                                                    ? getStrengthColor(passwordStrength.score)
                                                    : 'rgba(255, 255, 255, 0.1)',
                                                transition: 'background 0.3s'
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.75rem'
                                }}>
                                    <span style={{ color: getStrengthColor(passwordStrength.score) }}>
                                        {getStrengthLabel(passwordStrength.score)}
                                    </span>
                                    {passwordStrength.feedback && (
                                        <span style={{ color: 'var(--text-tertiary)' }}>
                                            {passwordStrength.feedback}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                            Confirm Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)'
                            }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                style={{
                                    ...inputStyle,
                                    paddingLeft: '40px',
                                    borderColor: confirmPassword && confirmPassword !== password
                                        ? 'rgba(239, 68, 68, 0.5)'
                                        : confirmPassword && confirmPassword === password
                                            ? 'rgba(16, 185, 129, 0.5)'
                                            : undefined
                                }}
                                required
                                minLength={8}
                                autoComplete="new-password"
                            />
                        </div>
                        {confirmPassword && confirmPassword !== password && (
                            <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>Passwords do not match</span>
                        )}
                        {confirmPassword && confirmPassword === password && password.length >= 8 && (
                            <span style={{ color: '#10b981', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle size={12} /> Passwords match
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading || password.length < 8 || password !== confirmPassword}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                            opacity: loading || password.length < 8 || password !== confirmPassword ? 0.6 : 1,
                            cursor: loading || password.length < 8 || password !== confirmPassword ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Lock size={18} />
                        <span>{loading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.75rem',
                    marginTop: '1.5rem',
                    lineHeight: '1.5'
                }}>
                    Your password must be at least 8 characters and should include a mix of letters, numbers, and symbols.
                </p>
            </div>
        </div>
    );
};

export default UpdatePassword;
