import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Replace this with your actual Pixel ID from TikTok Ads Manager
const TIKTOK_PIXEL_ID = 'D5OSC4BC77U0089ITJT0';

const TikTokPixel = () => {
    const location = useLocation();

    // Track page views on route change
    useEffect(() => {
        if (window.ttq) {
            window.ttq.page();
        }
    }, [location]);

    return null;
};

export default TikTokPixel;
