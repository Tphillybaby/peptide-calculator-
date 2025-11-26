import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>404</h1>
            <p>We couldn't find that page.</p>
            <Link to="/" style={{ color: 'var(--accent-primary)' }}>Return Home</Link>
        </div>
    );
};

export default NotFound;
