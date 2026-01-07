import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { device, statusBar, appEvents } from '../services/nativeService';

const Layout = () => {
    const location = useLocation();

    useEffect(() => {
        // Handle status bar styling based on theme
        if (device.isNative) {
            const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';
            statusBar.setStyle(isDarkMode ? 'dark' : 'light');

            if (device.isAndroid) {
                statusBar.setBackgroundColor('#0a0e1a');
            }
        }
    }, []);

    useEffect(() => {
        // Scroll to top on route change
        window.scrollTo(0, 0);
    }, [location.pathname]);

    useEffect(() => {
        // Handle Android back button
        if (device.isAndroid) {
            appEvents.addBackButtonListener(({ canGoBack }) => {
                if (canGoBack) {
                    window.history.back();
                } else if (location.pathname !== '/') {
                    window.history.back();
                } else {
                    // On home page, let the app minimize
                    appEvents.exitApp();
                }
            });
        }
    }, [location.pathname]);

    useEffect(() => {
        // Handle keyboard visibility to adjust layout
        const handleResize = () => {
            const viewportHeight = window.visualViewport?.height || window.innerHeight;
            const windowHeight = window.innerHeight;

            if (viewportHeight < windowHeight * 0.75) {
                document.body.classList.add('keyboard-open');
            } else {
                document.body.classList.remove('keyboard-open');
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                paddingTop: 'var(--safe-area-top, 0px)'
            }}
        >
            {/* Accessibility: Skip to main content link */}
            <a
                href="#main-content"
                className="skip-link"
                style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '16px',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '0 0 8px 8px',
                    zIndex: 9999,
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'top 0.3s ease',
                }}
            >
                Skip to main content
            </a>

            <main
                id="main-content"
                role="main"
                style={{
                    flex: 1,
                    paddingBottom: 'calc(80px + var(--safe-area-bottom, 0px))'
                }}
            >
                <Outlet />
            </main>
            <Navigation />
        </div>
    );
};

export default Layout;
