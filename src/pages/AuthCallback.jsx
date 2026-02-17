import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from '../components/PageLoader';

const AuthCallback = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // User is authenticated, redirect to dashboard
            navigate('/dashboard', { replace: true });
        } else {
            // If no user yet, wait a bit for Supabase to process the hash
            // The AuthContext will update 'user' once processed
            // If after a timeout we still don't have a user, something went wrong
            const timeout = setTimeout(() => {
                console.warn('Auth callback timeout - redirecting to login');
                navigate('/login', { replace: true });
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [user, navigate]);

    return <PageLoader type="dashboard" />; // Or a specific "Verifying..." loader
};

export default AuthCallback;
