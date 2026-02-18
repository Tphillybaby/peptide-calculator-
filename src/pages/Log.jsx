import { useAuth } from '../context/AuthContext';
import { useInjections } from '../hooks/useInjections';

const Log = () => {
    const { user } = useAuth();
    const { injections } = useInjections();

    return (
        <div className="padding-container" style={{ padding: '20px' }}>
            <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '10px', marginBottom: '20px', borderRadius: '4px', fontSize: '12px' }}>
                <strong>Debug Info:</strong><br />
                User ID: {user?.id || 'Not logged in'}<br />
                Records Visible: {injections.length}<br />
                (If you see records that are not yours, please screenshot this)
            </div>
            <InjectionLog />
        </div>
    );
};

export default Log;
