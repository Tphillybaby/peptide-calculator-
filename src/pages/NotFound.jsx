import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        // Track the 404 error including the path that failed
        trackEvent('error', '404_not_found', location.pathname);
    }, [location]);

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>404</h1>
            <p>We couldn't find that page.</p>
            <p style={{ marginTop: '10px', fontSize: '0.9em', opacity: 0.7 }}>Requested: {location.pathname}</p>
            <Link to="/" style={{ color: 'var(--accent-primary)', marginTop: '20px', display: 'inline-block' }}>Return Home</Link>
        </div>
    );
};

export default NotFound;
