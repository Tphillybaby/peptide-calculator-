import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, ArrowRight, ArrowLeft, Beaker, Activity, Brain, Heart, Zap, BookOpen,
    Loader2, Dumbbell, Moon, Shield, Sparkles, Flame, Pill, Syringe, Scale
} from 'lucide-react';
import { usePeptides } from '../hooks/usePeptides';
import SEO from '../components/SEO';
import SocialShare from '../components/SocialShare';
import { getEncyclopediaSchemas } from '../utils/pageSchemas';
import { POPULAR_PEPTIDES } from '../data/popularPeptides';
import styles from './Encyclopedia.module.css';

// Health benefit categories with keywords to match peptide benefits
const HEALTH_BENEFIT_CATEGORIES = [
    {
        id: 'muscle-recovery',
        name: 'Muscle & Recovery',
        description: 'Peptides for muscle growth, repair, and faster recovery',
        icon: Dumbbell,
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
        keywords: ['muscle', 'recovery', 'strength', 'repair', 'tissue', 'healing', 'tendon', 'ligament', 'flexibility']
    },
    {
        id: 'weight-loss',
        name: 'Weight Loss',
        description: 'GLP-1 agonists and metabolic peptides for fat loss',
        icon: Scale,
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
        keywords: ['weight loss', 'fat loss', 'appetite', 'metabolic', 'fat oxidation', 'body weight']
    },
    {
        id: 'anti-aging',
        name: 'Anti-Aging & Skin',
        description: 'Rejuvenation, collagen, and longevity peptides',
        icon: Sparkles,
        color: '#a855f7',
        gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        keywords: ['anti-aging', 'skin', 'collagen', 'elastin', 'wrinkle', 'rejuvenation', 'telomerase', 'longevity', 'hair growth']
    },
    {
        id: 'cognitive',
        name: 'Brain & Cognition',
        description: 'Nootropics and cognitive enhancement peptides',
        icon: Brain,
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        keywords: ['cognitive', 'memory', 'focus', 'brain', 'neuro', 'mental', 'nootropic', 'mood']
    },
    {
        id: 'sleep',
        name: 'Sleep & Recovery',
        description: 'Improve sleep quality and night-time recovery',
        icon: Moon,
        color: '#6366f1',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        keywords: ['sleep', 'rest', 'night', 'dreams']
    },
    {
        id: 'immune',
        name: 'Immune Support',
        description: 'Boost immune function and antiviral support',
        icon: Shield,
        color: '#14b8a6',
        gradient: 'linear-gradient(135deg, #14b8a6 0%, #22d3ee 100%)',
        keywords: ['immune', 'antiviral', 'infection', 'inflammation', 'anti-inflammatory']
    },
    {
        id: 'hormone',
        name: 'Hormone & GH',
        description: 'Growth hormone secretagogues and hormone support',
        icon: Zap,
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        keywords: ['growth hormone', 'GH', 'IGF-1', 'testosterone', 'hormone', 'ghrelin']
    },
    {
        id: 'sexual',
        name: 'Sexual Health',
        description: 'Libido enhancement and sexual function',
        icon: Heart,
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        keywords: ['libido', 'sexual', 'erectile', 'arousal']
    },
    {
        id: 'healing',
        name: 'Injury & Healing',
        description: 'Accelerate wound healing and tissue repair',
        icon: Activity,
        color: '#22c55e',
        gradient: 'linear-gradient(135deg, #22c55e 0%, #84cc16 100%)',
        keywords: ['healing', 'wound', 'injury', 'repair', 'joint', 'pain relief', 'blood flow']
    },
    {
        id: 'metabolic',
        name: 'Metabolism & Energy',
        description: 'Mitochondrial and metabolic support peptides',
        icon: Flame,
        color: '#f97316',
        gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        keywords: ['metabolic', 'mitochondria', 'energy', 'insulin', 'glucose', 'blood sugar', 'cardiovascular']
    }
];

const Encyclopedia = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const { peptides, loading } = usePeptides();

    // Function to check if a peptide matches a health benefit category
    const peptideMatchesCategory = (peptide, category) => {
        const benefitsText = (peptide.benefits || []).join(' ').toLowerCase();
        const descriptionText = (peptide.description || '').toLowerCase();
        const categoryText = (peptide.category || '').toLowerCase();
        const fullText = `${benefitsText} ${descriptionText} ${categoryText}`;

        return category.keywords.some(keyword => fullText.includes(keyword.toLowerCase()));
    };

    // Count peptides per category
    const categoryCounts = useMemo(() => {
        const counts = {};
        HEALTH_BENEFIT_CATEGORIES.forEach(cat => {
            counts[cat.id] = peptides.filter(p => peptideMatchesCategory(p, cat)).length;
        });
        return counts;
    }, [peptides]);

    // Filter peptides based on selected category and search
    const filteredPeptides = useMemo(() => {
        let results = peptides;

        // Filter by selected health benefit category
        if (selectedCategory) {
            const category = HEALTH_BENEFIT_CATEGORIES.find(c => c.id === selectedCategory);
            if (category) {
                results = results.filter(p => peptideMatchesCategory(p, category));
            }
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(peptide => {
                const name = (peptide.name || '').toLowerCase();
                const description = (peptide.description || '').toLowerCase();
                const benefits = (peptide.benefits || []).join(' ').toLowerCase();
                return name.includes(term) || description.includes(term) || benefits.includes(term);
            });
        }

        // Sort results: Popular trending items first
        return results.sort((a, b) => {
            const indexA = POPULAR_PEPTIDES.findIndex(p => p.name === a.name);
            const indexB = POPULAR_PEPTIDES.findIndex(p => p.name === b.name);

            // If both are popular, sort by popularity rank (lower index is better)
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;

            // If only A is popular, it goes first
            if (indexA !== -1) return -1;

            // If only B is popular, it goes first
            if (indexB !== -1) return 1;

            // Otherwise sort alphabetically
            return a.name.localeCompare(b.name);
        });
    }, [peptides, searchTerm, selectedCategory]);

    const selectedCategoryData = HEALTH_BENEFIT_CATEGORIES.find(c => c.id === selectedCategory);

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                <Loader2 className="spinning" size={48} color="var(--accent-primary)" />
            </div>
        );
    }

    return (
        <div className="page-container">
            <SEO
                title="Peptide Encyclopedia & Database"
                description="Browse our comprehensive database of peptides by health benefit. Find peptides for muscle recovery, weight loss, anti-aging, cognitive enhancement and more."
                canonical="/encyclopedia"
                jsonLd={getEncyclopediaSchemas()}
            />

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        {selectedCategory && (
                            <button
                                className={styles.backButton}
                                onClick={() => setSelectedCategory(null)}
                            >
                                <ArrowLeft size={20} />
                                <span>All Categories</span>
                            </button>
                        )}
                        <h1 className="gradient-text">
                            {selectedCategory ? selectedCategoryData?.name : 'Peptide Encyclopedia'}
                        </h1>
                        <p className={styles.subtitle}>
                            {selectedCategory
                                ? selectedCategoryData?.description
                                : 'Select a health benefit to explore peptides that can help'}
                        </p>
                    </div>
                    <div className={styles.headerRight}>
                        <SocialShare
                            title="Peptide Encyclopedia - PeptideLog"
                            description="Browse 100+ peptides organized by health benefits."
                            hashtags="peptides,biohacking,research"
                        />
                        <Link to="/guides" className={styles.guidesLink}>
                            <BookOpen size={18} />
                            <span>Guides</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Category Selection View */}
            {!selectedCategory && (
                <>
                    {/* Search across all */}
                    <div className={styles.searchBar}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Quick search all peptides..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {searchTerm ? (
                        // Show search results
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                Search Results ({filteredPeptides.length})
                            </h2>
                            <div className={styles.peptideGrid}>
                                {filteredPeptides.map(peptide => (
                                    <PeptideCard key={peptide.name} peptide={peptide} />
                                ))}
                            </div>
                            {filteredPeptides.length === 0 && (
                                <div className={styles.emptyState}>
                                    <Beaker size={48} />
                                    <h3>No peptides found</h3>
                                    <p>Try a different search term</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Show category cards
                        <div className={styles.categoriesGrid}>
                            {HEALTH_BENEFIT_CATEGORIES.map(category => {
                                const Icon = category.icon;
                                const count = categoryCounts[category.id];
                                return (
                                    <button
                                        key={category.id}
                                        className={styles.categoryCard}
                                        onClick={() => setSelectedCategory(category.id)}
                                        style={{ '--category-color': category.color, '--category-gradient': category.gradient }}
                                    >
                                        <div className={styles.categoryIcon}>
                                            <Icon size={28} />
                                        </div>
                                        <div className={styles.categoryInfo}>
                                            <h3>{category.name}</h3>
                                            <p>{category.description}</p>
                                        </div>
                                        <div className={styles.categoryMeta}>
                                            <span className={styles.peptideCount}>{count} peptides</span>
                                            <ArrowRight size={18} className={styles.arrow} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Stats bar */}
                    <div className={styles.statsBar}>
                        <div className={styles.stat}>
                            <Beaker size={20} />
                            <span>{peptides.length} Total Peptides</span>
                        </div>
                        <div className={styles.stat}>
                            <Activity size={20} />
                            <span>{HEALTH_BENEFIT_CATEGORIES.length} Categories</span>
                        </div>
                    </div>
                </>
            )}

            {/* Peptides List View (when category is selected) */}
            {selectedCategory && (
                <>
                    <div className={styles.searchBar}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder={`Search within ${selectedCategoryData?.name}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className={styles.resultCount}>{filteredPeptides.length} results</span>
                    </div>

                    <div className={styles.peptideGrid}>
                        {filteredPeptides.map(peptide => (
                            <PeptideCard key={peptide.name} peptide={peptide} categoryColor={selectedCategoryData?.color} />
                        ))}
                    </div>

                    {filteredPeptides.length === 0 && (
                        <div className={styles.emptyState}>
                            <Beaker size={48} />
                            <h3>No peptides found</h3>
                            <p>Try adjusting your search or go back to see all categories.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Peptide Card Component
const PeptideCard = ({ peptide, categoryColor }) => {
    const getCategoryIcon = (category) => {
        if (!category) return <Beaker size={20} />;
        if (category.includes('GLP-1') || category.includes('Metabolic')) return <Activity size={20} />;
        if (category.includes('Healing')) return <Heart size={20} />;
        if (category.includes('Cognitive') || category.includes('Nootropic')) return <Brain size={20} />;
        if (category.includes('Growth') || category.includes('Performance')) return <Zap size={20} />;
        if (category.includes('Immune')) return <Shield size={20} />;
        if (category.includes('Melanocortin')) return <Sparkles size={20} />;
        return <Beaker size={20} />;
    };

    return (
        <Link to={`/encyclopedia/${encodeURIComponent(peptide.name)}`} className={styles.peptideCard}>
            <div className={styles.peptideCardHeader}>
                <div
                    className={styles.peptideIcon}
                    style={{ '--icon-color': categoryColor || '#3b82f6' }}
                >
                    {getCategoryIcon(peptide.category)}
                </div>
                <span className={styles.peptideCategory}>{peptide.category}</span>
            </div>

            <h3 className={styles.peptideName}>{peptide.name}</h3>
            <p className={styles.peptideDescription}>
                {peptide.description && peptide.description.length > 100
                    ? peptide.description.substring(0, 100) + '...'
                    : peptide.description}
            </p>

            <div className={styles.peptideBenefits}>
                {(peptide.benefits || []).slice(0, 2).map((benefit, i) => (
                    <span key={i} className={styles.benefitTag}>
                        {benefit.length > 30 ? benefit.substring(0, 30) + '...' : benefit}
                    </span>
                ))}
            </div>

            <div className={styles.peptideFooter}>
                <span className={styles.viewProtocol}>
                    View Protocol <ArrowRight size={16} />
                </span>
            </div>
        </Link>
    );
};

export default Encyclopedia;
