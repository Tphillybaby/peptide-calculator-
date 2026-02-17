import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Book, Filter, ChevronRight, ExternalLink,
    Bookmark, BookmarkCheck, Calendar, Users, FileText,
    Star, ArrowUpRight, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import researchService, { RESEARCH_CATEGORIES } from '../services/researchService';
import styles from './ResearchLibrary.module.css';

const ResearchLibrary = () => {
    const { user } = useAuth();
    const [papers, setPapers] = useState([]);
    const [savedPaperIds, setSavedPaperIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPeptide, setSelectedPeptide] = useState(null);
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Load papers
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const options = {};
                if (selectedCategory) options.category = selectedCategory;
                if (selectedPeptide) options.peptide = selectedPeptide;
                if (searchQuery) options.search = searchQuery;

                const data = await researchService.getPapers(options);
                setPapers(data);

                // Load saved paper IDs
                if (user) {
                    const saved = await researchService.getSavedPapers(user.id);
                    setSavedPaperIds(new Set(saved.map(s => s.paper_id)));
                }
            } catch (err) {
                console.error('Error loading research:', err);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(loadData, searchQuery ? 300 : 0);
        return () => clearTimeout(debounce);
    }, [selectedCategory, selectedPeptide, searchQuery, user]);

    // Get unique peptides from papers
    const allPeptides = useMemo(() => {
        const peptides = new Set();
        papers.forEach(paper => {
            paper.peptides?.forEach(p => peptides.add(p));
        });
        return Array.from(peptides).sort();
    }, [papers]);

    // Featured papers
    const featuredPapers = useMemo(() =>
        papers.filter(p => p.is_featured).slice(0, 3),
        [papers]
    );

    // Toggle save paper
    const handleSavePaper = async (paperId) => {
        if (!user) return;

        try {
            if (savedPaperIds.has(paperId)) {
                await researchService.unsavePaper(user.id, paperId);
                setSavedPaperIds(prev => {
                    const next = new Set(prev);
                    next.delete(paperId);
                    return next;
                });
            } else {
                await researchService.savePaper(user.id, paperId);
                setSavedPaperIds(prev => new Set([...prev, paperId]));
            }
        } catch (err) {
            console.error('Error toggling save:', err);
        }
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedPeptide(null);
        setSearchQuery('');
    };

    const hasActiveFilters = selectedCategory || selectedPeptide || searchQuery;

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1><Book size={28} /> Research Library</h1>
                    <p>Curated scientific papers and clinical studies on peptides</p>
                </div>
            </header>

            {/* Search & Filters */}
            <div className={styles.searchSection}>
                <div className={styles.searchBar}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search papers, authors, or topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button
                    className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={18} />
                    Filters
                    {hasActiveFilters && <span className={styles.filterBadge} />}
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className={styles.filterPanel}>
                    <div className={styles.filterGroup}>
                        <h3>Category</h3>
                        <div className={styles.filterOptions}>
                            {Object.entries(RESEARCH_CATEGORIES).map(([key, cat]) => (
                                <button
                                    key={key}
                                    className={`${styles.filterChip} ${selectedCategory === key ? styles.active : ''}`}
                                    onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                                    style={{ '--chip-color': cat.color }}
                                >
                                    {cat.icon} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {allPeptides.length > 0 && (
                        <div className={styles.filterGroup}>
                            <h3>Peptide</h3>
                            <div className={styles.filterOptions}>
                                {allPeptides.slice(0, 10).map(peptide => (
                                    <button
                                        key={peptide}
                                        className={`${styles.filterChip} ${selectedPeptide === peptide ? styles.active : ''}`}
                                        onClick={() => setSelectedPeptide(selectedPeptide === peptide ? null : peptide)}
                                    >
                                        {peptide}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasActiveFilters && (
                        <button className={styles.clearFilters} onClick={clearFilters}>
                            Clear All Filters
                        </button>
                    )}
                </div>
            )}

            {/* Featured Section */}
            {!hasActiveFilters && featuredPapers.length > 0 && (
                <section className={styles.featuredSection}>
                    <h2><Star size={20} /> Featured Research</h2>
                    <div className={styles.featuredGrid}>
                        {featuredPapers.map(paper => (
                            <article
                                key={paper.id}
                                className={styles.featuredCard}
                                onClick={() => setSelectedPaper(paper)}
                            >
                                <div className={styles.featuredBadge}>
                                    <Star size={14} /> Featured
                                </div>
                                <h3>{paper.title}</h3>
                                <p className={styles.paperAuthors}>
                                    {paper.authors?.slice(0, 2).join(', ')}
                                    {paper.authors?.length > 2 && ' et al.'}
                                </p>
                                <p className={styles.paperSummary}>{paper.summary}</p>
                                <div className={styles.paperTags}>
                                    {paper.peptides?.slice(0, 2).map(p => (
                                        <span key={p} className={styles.peptideTag}>{p}</span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* Results */}
            <section className={styles.resultsSection}>
                <div className={styles.resultsHeader}>
                    <h2>
                        {hasActiveFilters ? 'Search Results' : 'All Papers'}
                        <span className={styles.resultCount}>({papers.length})</span>
                    </h2>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.loadingSpinner} />
                        <p>Loading research papers...</p>
                    </div>
                ) : papers.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FileText size={48} />
                        <h3>No papers found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className={styles.papersList}>
                        {papers.map(paper => (
                            <article
                                key={paper.id}
                                className={styles.paperCard}
                                onClick={() => setSelectedPaper(paper)}
                            >
                                <div className={styles.paperMain}>
                                    <h3>{paper.title}</h3>
                                    <p className={styles.paperAuthors}>
                                        <Users size={14} />
                                        {paper.authors?.slice(0, 3).join(', ')}
                                        {paper.authors?.length > 3 && ` +${paper.authors.length - 3} more`}
                                    </p>
                                    <p className={styles.paperMeta}>
                                        <span><Calendar size={14} /> {paper.publication_date ? new Date(paper.publication_date).toLocaleDateString() : 'N/A'}</span>
                                        {paper.journal && <span>• {paper.journal}</span>}
                                    </p>
                                    <p className={styles.paperAbstract}>
                                        {paper.summary || paper.abstract?.substring(0, 200) + '...'}
                                    </p>
                                    <div className={styles.paperTags}>
                                        {paper.peptides?.map(p => (
                                            <span key={p} className={styles.peptideTag}>{p}</span>
                                        ))}
                                        {paper.categories?.slice(0, 2).map(c => (
                                            <span
                                                key={c}
                                                className={styles.categoryTag}
                                                style={{ background: RESEARCH_CATEGORIES[c]?.color + '20', color: RESEARCH_CATEGORIES[c]?.color }}
                                            >
                                                {RESEARCH_CATEGORIES[c]?.name || c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.paperActions}>
                                    {user && (
                                        <button
                                            className={`${styles.saveBtn} ${savedPaperIds.has(paper.id) ? styles.saved : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSavePaper(paper.id);
                                            }}
                                        >
                                            {savedPaperIds.has(paper.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                                        </button>
                                    )}
                                    <ChevronRight size={20} className={styles.chevron} />
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Paper Detail Modal */}
            {selectedPaper && (
                <div className={styles.modalOverlay} onClick={() => setSelectedPaper(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setSelectedPaper(null)}>
                            <X size={24} />
                        </button>

                        <div className={styles.modalHeader}>
                            {selectedPaper.is_featured && (
                                <span className={styles.featuredTag}><Star size={14} /> Featured</span>
                            )}
                            <h2>{selectedPaper.title}</h2>
                            <p className={styles.modalAuthors}>
                                {selectedPaper.authors?.join(', ')}
                            </p>
                            <div className={styles.modalMeta}>
                                {selectedPaper.journal && <span>{selectedPaper.journal}</span>}
                                {selectedPaper.publication_date && (
                                    <span>• {new Date(selectedPaper.publication_date).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.modalBody}>
                            {selectedPaper.summary && (
                                <section>
                                    <h3>Summary</h3>
                                    <p>{selectedPaper.summary}</p>
                                </section>
                            )}

                            {selectedPaper.key_findings?.length > 0 && (
                                <section>
                                    <h3>Key Findings</h3>
                                    <ul className={styles.keyFindings}>
                                        {selectedPaper.key_findings.map((finding, idx) => (
                                            <li key={idx}>{finding}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {selectedPaper.abstract && (
                                <section>
                                    <h3>Abstract</h3>
                                    <p className={styles.abstract}>{selectedPaper.abstract}</p>
                                </section>
                            )}

                            <div className={styles.modalTags}>
                                {selectedPaper.peptides?.map(p => (
                                    <Link
                                        key={p}
                                        to={`/encyclopedia/${encodeURIComponent(p)}`}
                                        className={styles.peptideLink}
                                        onClick={() => setSelectedPaper(null)}
                                    >
                                        {p} <ArrowUpRight size={12} />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            {user && (
                                <button
                                    className={`${styles.saveButton} ${savedPaperIds.has(selectedPaper.id) ? styles.saved : ''}`}
                                    onClick={() => handleSavePaper(selectedPaper.id)}
                                >
                                    {savedPaperIds.has(selectedPaper.id) ? (
                                        <><BookmarkCheck size={18} /> Saved</>
                                    ) : (
                                        <><Bookmark size={18} /> Save Paper</>
                                    )}
                                </button>
                            )}
                            {selectedPaper.url && (
                                <a
                                    href={selectedPaper.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.viewSource}
                                >
                                    View Source <ExternalLink size={16} />
                                </a>
                            )}
                            {selectedPaper.doi && (
                                <a
                                    href={`https://doi.org/${selectedPaper.doi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.doiLink}
                                >
                                    DOI: {selectedPaper.doi}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResearchLibrary;
