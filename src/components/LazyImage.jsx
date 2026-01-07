import React, { useState, useRef, useEffect } from 'react';

/**
 * LazyImage - Optimized image component with lazy loading and blur-up effect
 * Prevents CLS by reserving space and improves LCP by lazy loading off-screen images
 */
const LazyImage = ({
    src,
    alt,
    width,
    height,
    className = '',
    style = {},
    placeholder = null,
    onLoad = null,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        // Use Intersection Observer for lazy loading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px 0px', // Start loading 50px before entering viewport
                threshold: 0.01,
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        if (onLoad) onLoad();
    };

    // Placeholder styles
    const placeholderStyle = {
        backgroundColor: 'var(--glass-bg, rgba(26, 31, 53, 0.5))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    // Container ensures space is reserved to prevent CLS
    const containerStyle = {
        position: 'relative',
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
        overflow: 'hidden',
        ...style,
    };

    const imgStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
    };

    return (
        <div ref={imgRef} style={containerStyle} className={className}>
            {/* Placeholder while loading */}
            {!isLoaded && (
                <div
                    style={{
                        ...placeholderStyle,
                        position: 'absolute',
                        inset: 0,
                    }}
                    aria-hidden="true"
                >
                    {placeholder || (
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            style={{ opacity: 0.3 }}
                        >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    )}
                </div>
            )}

            {/* Actual image - only load src when in view */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    onLoad={handleLoad}
                    style={imgStyle}
                    loading="lazy"
                    decoding="async"
                    {...props}
                />
            )}
        </div>
    );
};

export default LazyImage;
