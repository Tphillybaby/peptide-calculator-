import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, UserPlus, Bookmark, TrendingUp, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInteractionCount, wasRecentlyDismissed, PROMPT_STORAGE_KEY } from '../utils/signupPromptUtils';

const SignupPrompt = ({ trigger = 'default' }) => {
    const { user } = useAuth();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Don't show if user is logged in
        if (user) return;

        // Don't show if recently dismissed
        if (wasRecentlyDismissed()) return;

        // Show after 3+ interactions
        const count = getInteractionCount();

        if (count >= 3) {
            // Delay showing the prompt for better UX
            const timer = setTimeout(() => {
                setVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleDismiss = () => {
        localStorage.setItem(PROMPT_STORAGE_KEY, Date.now().toString());
        setVisible(false);
    };

    if (!visible) return null;

    const benefits = [
        { icon: Bookmark, text: 'Save your calculations' },
        { icon: TrendingUp, text: 'Track your progress over time' },
        { icon: Bell, text: 'Get injection reminders' },
    ];

    const triggerMessages = {
        calculator: "Like using the calculator? Save your settings!",
        injection: "Want to track this injection?",
        default: "Get more from PeptideLog"
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: '90%',
            maxWidth: '400px',
            animation: 'slideUp 0.3s ease-out'
        }}>
            <style>
                {`
          @keyframes slideUp {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}
            </style>
            <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <button
                    onClick={handleDismiss}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white'
                    }}
                >
                    <X size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        padding: '10px',
                        display: 'flex'
                    }}>
                        <UserPlus size={24} color="white" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>
                            {triggerMessages[trigger] || triggerMessages.default}
                        </h3>
                        <p style={{ margin: '4px 0 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>
                            Create a free account to unlock:
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {benefits.map((benefit, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <benefit.icon size={16} color="rgba(255, 255, 255, 0.9)" />
                            <span style={{ color: 'white', fontSize: '0.9rem' }}>{benefit.text}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link
                        to="/signup"
                        style={{
                            flex: 1,
                            background: 'white',
                            color: '#6366f1',
                            padding: '12px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                        }}
                    >
                        Sign Up Free
                    </Link>
                    <Link
                        to="/login"
                        style={{
                            flex: 1,
                            background: 'rgba(255, 255, 255, 0.15)',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignupPrompt;
