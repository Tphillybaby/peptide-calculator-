import React from 'react';

// Page skeleton loader that maintains layout space to prevent CLS
const PageLoader = ({ type = 'default' }) => {
    const baseStyle = {
        padding: '20px',
        minHeight: '60vh',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    };

    const skeletonStyle = {
        background: 'var(--glass-bg, rgba(26, 31, 53, 0.5))',
        borderRadius: '12px',
        marginBottom: '16px',
    };

    // Different skeleton layouts based on page type
    const getSkeletonContent = () => {
        switch (type) {
            case 'calculator':
                return (
                    <>
                        {/* Header skeleton */}
                        <div style={{ ...skeletonStyle, height: '48px', width: '60%', marginBottom: '24px' }} />
                        {/* Form area skeleton */}
                        <div style={{ ...skeletonStyle, height: '300px', width: '100%' }} />
                        {/* Results area skeleton */}
                        <div style={{ ...skeletonStyle, height: '150px', width: '100%', marginTop: '24px' }} />
                    </>
                );

            case 'encyclopedia':
                return (
                    <>
                        {/* Header skeleton */}
                        <div style={{ ...skeletonStyle, height: '48px', width: '50%', marginBottom: '16px' }} />
                        {/* Search bar skeleton */}
                        <div style={{ ...skeletonStyle, height: '48px', width: '100%', marginBottom: '24px' }} />
                        {/* Grid skeleton */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} style={{ ...skeletonStyle, height: '180px' }} />
                            ))}
                        </div>
                    </>
                );

            case 'guide':
                return (
                    <>
                        {/* Header skeleton */}
                        <div style={{ ...skeletonStyle, height: '48px', width: '70%', marginBottom: '24px' }} />
                        {/* Content skeleton */}
                        <div style={{ ...skeletonStyle, height: '24px', width: '100%' }} />
                        <div style={{ ...skeletonStyle, height: '24px', width: '95%' }} />
                        <div style={{ ...skeletonStyle, height: '24px', width: '88%' }} />
                        <div style={{ ...skeletonStyle, height: '200px', width: '100%', marginTop: '24px' }} />
                        <div style={{ ...skeletonStyle, height: '24px', width: '92%', marginTop: '24px' }} />
                        <div style={{ ...skeletonStyle, height: '24px', width: '85%' }} />
                    </>
                );

            case 'forum':
                return (
                    <>
                        {/* Header skeleton */}
                        <div style={{ ...skeletonStyle, height: '48px', width: '40%', marginBottom: '24px' }} />
                        {/* Thread list skeleton */}
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ ...skeletonStyle, height: '80px', width: '100%' }} />
                        ))}
                    </>
                );

            case 'prices':
                return (
                    <>
                        {/* Header skeleton */}
                        <div style={{ ...skeletonStyle, height: '48px', width: '55%', marginBottom: '16px' }} />
                        {/* Search skeleton */}
                        <div style={{ ...skeletonStyle, height: '48px', width: '100%', marginBottom: '24px' }} />
                        {/* Table skeleton */}
                        <div style={{ ...skeletonStyle, height: '400px', width: '100%' }} />
                    </>
                );

            case 'inventory':
                return (
                    <>
                        {/* Header skeleton */}
                        <div style={{ ...skeletonStyle, height: '48px', width: '45%', marginBottom: '24px' }} />
                        {/* Stats row skeleton */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ ...skeletonStyle, height: '100px' }} />
                            ))}
                        </div>
                        {/* List skeleton */}
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ ...skeletonStyle, height: '72px', width: '100%' }} />
                        ))}
                    </>
                );

            default:
                return (
                    <>
                        {/* Generic page skeleton */}
                        <div style={{ ...skeletonStyle, height: '48px', width: '50%', marginBottom: '24px' }} />
                        <div style={{ ...skeletonStyle, height: '200px', width: '100%' }} />
                        <div style={{ ...skeletonStyle, height: '150px', width: '100%', marginTop: '24px' }} />
                    </>
                );
        }
    };

    return (
        <div style={baseStyle} aria-label="Loading content" role="progressbar">
            {getSkeletonContent()}
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
};

export default PageLoader;
