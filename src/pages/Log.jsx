import React, { Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInjections } from '../hooks/useInjections';
import { Loader } from 'lucide-react';

// Use React.lazy to properly handle chunk loading with error recovery
const InjectionLog = React.lazy(() =>
    import('../components/InjectionLog').catch((err) => {
        console.error('[Log] Failed to load InjectionLog chunk:', err);
        // Return a fallback module so the app doesn't crash
        return {
            default: () => (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px'
                }}>
                    <p style={{ marginBottom: '1rem' }}>Failed to load the injection log. This may be due to a network issue.</p>
                    <button
                        className="btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </button>
                </div>
            )
        };
    })
);

const LogFallback = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        gap: '1rem'
    }}>
        <Loader size={28} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading injection log...</p>
    </div>
);

const Log = () => {
    const { user, isAdmin } = useAuth();
    const { injections } = useInjections();

    return (
        <div className="padding-container" style={{ padding: '20px' }}>
            {isAdmin && (
                <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '10px', marginBottom: '20px', borderRadius: '4px', fontSize: '12px' }}>
                    <strong>Debug Info (Admins Only):</strong><br />
                    User ID: {user?.id || 'Not logged in'}<br />
                    Records Visible: {injections.length}<br />
                </div>
            )}
            <Suspense fallback={<LogFallback />}>
                <InjectionLog />
            </Suspense>
        </div>
    );
};

export default Log;
