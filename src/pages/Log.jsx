import { useAuth } from '../context/AuthContext';
import { useInjections } from '../hooks/useInjections';

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
            <InjectionLog />
        </div>
    );
};

export default Log;
