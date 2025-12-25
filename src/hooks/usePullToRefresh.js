/**
 * usePullToRefresh Hook
 * Provides native-like pull-to-refresh functionality for mobile
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { haptics, device } from '../services/nativeService';

export function usePullToRefresh(onRefresh, options = {}) {
    const {
        threshold = 80,       // Distance needed to trigger refresh
        resistance = 2.5,     // How hard it is to pull
        maxPull = 120,        // Maximum pull distance
        disabled = false
    } = options;

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isPulling, setIsPulling] = useState(false);

    const startY = useRef(0);
    const currentY = useRef(0);
    const containerRef = useRef(null);

    const handleTouchStart = useCallback((e) => {
        if (disabled || isRefreshing) return;

        // Only trigger if at top of scroll
        if (window.scrollY > 0) return;

        startY.current = e.touches[0].clientY;
        setIsPulling(true);
    }, [disabled, isRefreshing]);

    const handleTouchMove = useCallback((e) => {
        if (!isPulling || disabled || isRefreshing) return;

        currentY.current = e.touches[0].clientY;
        const delta = (currentY.current - startY.current) / resistance;

        if (delta > 0 && window.scrollY === 0) {
            e.preventDefault();
            const distance = Math.min(delta, maxPull);
            setPullDistance(distance);

            // Haptic feedback when threshold is crossed
            if (distance >= threshold && pullDistance < threshold) {
                haptics.impact('medium');
            }
        }
    }, [isPulling, disabled, isRefreshing, resistance, maxPull, threshold, pullDistance]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        if (pullDistance >= threshold && onRefresh) {
            setIsRefreshing(true);
            haptics.notification('success');

            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh error:', error);
            } finally {
                setIsRefreshing(false);
            }
        }

        setPullDistance(0);
        setIsPulling(false);
        startY.current = 0;
        currentY.current = 0;
    }, [isPulling, pullDistance, threshold, onRefresh]);

    useEffect(() => {
        if (!device.isNative) return; // Only for native apps

        const options = { passive: false };

        document.addEventListener('touchstart', handleTouchStart, options);
        document.addEventListener('touchmove', handleTouchMove, options);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    // Calculate progress (0 to 1)
    const progress = Math.min(pullDistance / threshold, 1);

    return {
        containerRef,
        isRefreshing,
        isPulling,
        pullDistance,
        progress,
        // Style to apply to the pull indicator
        indicatorStyle: {
            transform: `translateY(${pullDistance}px)`,
            opacity: progress,
            transition: isPulling ? 'none' : 'transform 0.3s ease, opacity 0.3s ease'
        }
    };
}

/**
 * Pull to Refresh Indicator Component
 */
export function PullToRefreshIndicator({ isRefreshing, progress, pullDistance }) {
    if (pullDistance === 0 && !isRefreshing) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 'var(--safe-area-top, 20px)',
                height: 60,
                pointerEvents: 'none',
                zIndex: 9999,
                transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`,
                transition: pullDistance > 0 ? 'none' : 'transform 0.3s ease'
            }}
        >
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    transform: `rotate(${progress * 180}deg) scale(${0.5 + progress * 0.5})`,
                    transition: isRefreshing ? 'none' : 'transform 0.1s ease'
                }}
            >
                {isRefreshing ? (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ animation: 'spin 1s linear infinite' }}
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="var(--accent-primary)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="40 20"
                        />
                    </svg>
                ) : (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 5v14M5 12l7-7 7 7" />
                    </svg>
                )}
            </div>
        </div>
    );
}

export default usePullToRefresh;
