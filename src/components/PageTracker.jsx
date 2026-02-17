import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';

const PageTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // Track the initial page load and subsequent navigation
        trackPageView(location.pathname + location.search);
    }, [location]);

    return null;
};

export default PageTracker;
