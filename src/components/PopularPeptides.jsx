import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import styles from './PopularPeptides.module.css';

/**
 * SEO Internal Linking Component
 * 
 * This component displays popular/trending peptides with direct links to their
 * encyclopedia pages. This improves internal linking for SEO, helping Google
 * discover and index all encyclopedia pages.
 */

import { POPULAR_PEPTIDES } from '../data/popularPeptides';

const PopularPeptides = ({ variant = 'default', limit = 8 }) => {
    const displayPeptides = POPULAR_PEPTIDES.slice(0, limit);

    if (variant === 'compact') {
        return (
            <div className={styles.compactContainer}>
                <div className={styles.compactHeader}>
                    <TrendingUp size={16} />
                    <span>Popular Peptides</span>
                </div>
                <div className={styles.compactList}>
                    {displayPeptides.map(peptide => (
                        <Link
                            key={peptide.name}
                            to={`/encyclopedia/${encodeURIComponent(peptide.name)}`}
                            className={styles.compactLink}
                        >
                            {peptide.name}
                        </Link>
                    ))}
                    <Link to="/encyclopedia" className={styles.compactViewAll}>
                        View All <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <TrendingUp size={20} className={styles.trendingIcon} />
                    <h2>Popular Peptides</h2>
                </div>
                <Link to="/encyclopedia" className={styles.viewAllBtn}>
                    View Encyclopedia <ArrowRight size={16} />
                </Link>
            </div>
            <div className={styles.grid}>
                {displayPeptides.map(peptide => (
                    <Link
                        key={peptide.name}
                        to={`/encyclopedia/${encodeURIComponent(peptide.name)}`}
                        className={styles.peptideCard}
                    >
                        <div className={styles.cardContent}>
                            <span className={styles.peptideName}>{peptide.name}</span>
                            <span className={styles.peptideTag}>{peptide.tag}</span>
                        </div>
                        {peptide.trending && (
                            <span className={styles.trendingBadge}>Trending</span>
                        )}
                        <ArrowRight size={16} className={styles.arrow} />
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default PopularPeptides;
