import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';

const PageTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // Small delay so document.title has been updated by the SEO/Helmet component
        const timer = setTimeout(() => {
            trackPageView(location.pathname + location.search);
        }, 100);
        return () => clearTimeout(timer);
    }, [location]);

    return null;
};

export default PageTracker;
