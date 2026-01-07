import React from 'react';
import styles from './Skeleton.module.css';

/**
 * Skeleton - A placeholder loading component that mimics content structure
 * Use instead of spinners for better perceived performance
 */

// Base skeleton element with shimmer animation
export const Skeleton = ({
    width,
    height,
    borderRadius = '8px',
    className = '',
    style = {}
}) => (
    <div
        className={`${styles.skeleton} ${className}`}
        style={{
            width,
            height,
            borderRadius,
            ...style
        }}
    />
);

// Text line skeleton
export const SkeletonText = ({ lines = 1, width = '100%', className = '' }) => (
    <div className={`${styles.textContainer} ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <div
                key={i}
                className={styles.skeleton}
                style={{
                    height: '14px',
                    width: i === lines - 1 && lines > 1 ? '70%' : width,
                    borderRadius: '4px',
                    marginBottom: i < lines - 1 ? '8px' : 0
                }}
            />
        ))}
    </div>
);

// Card skeleton
export const SkeletonCard = ({ className = '' }) => (
    <div className={`${styles.card} ${className}`}>
        <Skeleton height="24px" width="60%" style={{ marginBottom: '12px' }} />
        <SkeletonText lines={2} />
        <div className={styles.cardFooter}>
            <Skeleton height="32px" width="80px" borderRadius="16px" />
            <Skeleton height="20px" width="60px" />
        </div>
    </div>
);

// Avatar skeleton
export const SkeletonAvatar = ({ size = 40, className = '' }) => (
    <Skeleton
        width={`${size}px`}
        height={`${size}px`}
        borderRadius="50%"
        className={className}
    />
);

// Pre-generated widths for list items (deterministic)
const LIST_WIDTHS = ['85%', '70%', '90%', '75%', '80%'];
const LIST_WIDTHS_SUB = ['55%', '45%', '60%', '50%', '65%'];

// Dashboard skeleton layout
export const DashboardSkeleton = () => (
    <div className={styles.dashboardSkeleton}>
        {/* Header */}
        <div className={styles.header}>
            <Skeleton height="32px" width="200px" />
            <Skeleton height="16px" width="150px" style={{ marginTop: '8px' }} />
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={styles.statCard}>
                    <Skeleton height="40px" width="40px" borderRadius="12px" />
                    <div className={styles.statContent}>
                        <Skeleton height="24px" width="60px" />
                        <Skeleton height="14px" width="80px" style={{ marginTop: '4px' }} />
                    </div>
                </div>
            ))}
        </div>

        {/* Quick actions grid */}
        <div className={styles.quickActionsGrid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={styles.quickAction}>
                    <Skeleton height="48px" width="48px" borderRadius="12px" />
                    <Skeleton height="14px" width="70%" style={{ marginTop: '12px' }} />
                </div>
            ))}
        </div>

        {/* Recent activity */}
        <div className={styles.section}>
            <Skeleton height="20px" width="140px" style={{ marginBottom: '16px' }} />
            {[1, 2, 3].map(i => (
                <div key={i} className={styles.activityItem}>
                    <SkeletonAvatar size={36} />
                    <div className={styles.activityContent}>
                        <Skeleton height="16px" width="60%" />
                        <Skeleton height="12px" width="40%" style={{ marginTop: '6px' }} />
                    </div>
                    <Skeleton height="24px" width="60px" borderRadius="12px" />
                </div>
            ))}
        </div>
    </div>
);

// List skeleton
export const ListSkeleton = ({ items = 5, showAvatar = false }) => (
    <div className={styles.listSkeleton}>
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className={styles.listItem}>
                {showAvatar && <SkeletonAvatar size={40} />}
                <div className={styles.listItemContent}>
                    <Skeleton height="16px" width={LIST_WIDTHS[i % LIST_WIDTHS.length]} />
                    <Skeleton height="12px" width={LIST_WIDTHS_SUB[i % LIST_WIDTHS_SUB.length]} style={{ marginTop: '6px' }} />
                </div>
            </div>
        ))}
    </div>
);

// Pre-generated widths for table columns (deterministic)
const TABLE_WIDTHS = ['70%', '85%', '60%', '90%', '75%', '80%', '65%', '95%'];

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
    <div className={styles.tableSkeleton}>
        <div className={styles.tableHeader}>
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} height="14px" width={TABLE_WIDTHS[i % TABLE_WIDTHS.length]} />
            ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={styles.tableRow}>
                {Array.from({ length: columns }).map((_, j) => (
                    <Skeleton key={j} height="16px" width={TABLE_WIDTHS[(i + j) % TABLE_WIDTHS.length]} />
                ))}
            </div>
        ))}
    </div>
);

// Pre-generated heights for chart bars (deterministic)
const CHART_HEIGHTS = ['45%', '70%', '35%', '80%', '55%', '65%', '40%', '75%', '50%', '60%', '85%', '30%'];

// Chart skeleton
export const ChartSkeleton = ({ height = 300 }) => (
    <div className={styles.chartSkeleton} style={{ height }}>
        <div className={styles.chartBars}>
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className={styles.chartBar}
                    style={{ height: CHART_HEIGHTS[i] }}
                />
            ))}
        </div>
        <div className={styles.chartXAxis}>
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height="10px" width="30px" />
            ))}
        </div>
    </div>
);

export default Skeleton;
