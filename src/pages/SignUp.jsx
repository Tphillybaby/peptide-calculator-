import React, { useState } from 'react';
import { UserPlus, AlertCircle, CheckCircle, Mail, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PasswordStrengthMeter, calculatePasswordStrength } from '../utils/passwordStrength';

const SignUp = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { signUp } = useAuth();
    const passwordStrength = calculatePasswordStrength(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            setLoading(false);
            return;
        }

        if (!passwordStrength.isValid) {
            setError("Please create a stronger password");
            setLoading(false);
            return;
        }

        try {
            await signUp(email, password, fullName);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
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
        transition: 'border-color 0.2s, box-shadow 0.2s',
        width: '100%',
        boxSizing: 'border-box'
    };

    // Success state - show email confirmation message
    if (success) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh'
            }}>
                <div className="card glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '1rem',
                        borderRadius: '50%',
                        marginBottom: '1.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Mail size={40} color="#10b981" />
                    </div>
                    <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600' }}>Check Your Email</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        We've sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                        Please click the link to verify your account.
                    </p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Didn't receive the email? Check your spam folder.
                    </p>
                    <Link
                        to="/login"
                        className="btn-primary"
                        style={{ display: 'inline-block', textDecoration: 'none' }}
                    >
                        Go to Login
                    </Link>
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
                        <UserPlus size={32} color="var(--accent-primary)" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Join PeptideLog today</p>
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
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password (min. 6 characters)"
                            style={inputStyle}
                            required
                            minLength={6}
                        />
                        <PasswordStrengthMeter password={password} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            style={inputStyle}
                            required
                        />
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
                        <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                        {!loading && <UserPlus size={18} />}
                    </button>
                </form>

                <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--glass-border)',
                    textAlign: 'center'
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            style={{
                                color: 'var(--accent-primary)',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                <p style={{
                    color: 'var(--text-tertiary)',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    marginTop: '1rem',
                    lineHeight: '1.5'
                }}>
                    By creating an account, you agree to our{' '}
                    <Link to="/terms" style={{ color: 'var(--text-secondary)' }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
