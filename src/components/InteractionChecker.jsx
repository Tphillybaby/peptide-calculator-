import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle, Check, AlertCircle, Info, Search,
    Plus, X, ChevronRight, Shield, Zap, Minus
} from 'lucide-react';
import interactionService, { INTERACTION_TYPES, SEVERITY_LEVELS } from '../services/interactionService';
import { supabase } from '../lib/supabase';
import styles from './InteractionChecker.module.css';

const InteractionChecker = () => {
    const [selectedCompounds, setSelectedCompounds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [interactions, setInteractions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allPeptides, setAllPeptides] = useState([]);
    const [showSearch, setShowSearch] = useState(false);

    // Load all peptides for selection
    useEffect(() => {
        const loadPeptides = async () => {
            try {
                const { data, error } = await supabase
                    .from('peptides')
                    .select('name')
                    .order('name');

                if (error) throw error;
                setAllPeptides(data?.map(p => p.name) || []);
            } catch (err) {
                console.error('Error loading peptides:', err);
            }
        };

        loadPeptides();
    }, []);

    // Filter peptides based on search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = allPeptides
            .filter(p =>
                p.toLowerCase().includes(query) &&
                !selectedCompounds.includes(p)
            )
            .slice(0, 8);

        setSearchResults(filtered);
    }, [searchQuery, allPeptides, selectedCompounds]);

    // Check interactions when compounds change
    useEffect(() => {
        const checkInteractions = async () => {
            if (selectedCompounds.length < 2) {
                setInteractions([]);
                setSummary(null);
                return;
            }

            setLoading(true);
            try {
                const result = await interactionService.getStackSummary(selectedCompounds);
                setInteractions(result.interactions);
                setSummary(result.summary);
            } catch (err) {
                console.error('Error checking interactions:', err);
            } finally {
                setLoading(false);
            }
        };

        checkInteractions();
    }, [selectedCompounds]);

    const addCompound = (compound) => {
        if (!selectedCompounds.includes(compound)) {
            setSelectedCompounds([...selectedCompounds, compound]);
        }
        setSearchQuery('');
        setShowSearch(false);
    };

    const removeCompound = (compound) => {
        setSelectedCompounds(selectedCompounds.filter(c => c !== compound));
    };

    const clearAll = () => {
        setSelectedCompounds([]);
    };

    const getInteractionIcon = (type) => {
        switch (type) {
            case 'synergy':
                return <Zap size={20} />;
            case 'caution':
                return <AlertCircle size={20} />;
            case 'avoid':
                return <AlertTriangle size={20} />;
            default:
                return <Info size={20} />;
        }
    };

    // Common stacks for quick selection
    const commonStacks = [
        { name: 'GH Stack', compounds: ['Ipamorelin', 'CJC-1295 (no DAC)'] },
        { name: 'Healing Stack', compounds: ['BPC-157', 'TB-500 (Thymosin Beta-4)'] },
        { name: 'Nootropic Stack', compounds: ['Semax', 'Selank'] },
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1><Shield size={28} /> Interaction Checker</h1>
                    <p>Check for interactions between peptides before combining them</p>
                </div>
            </header>

            {/* Safety Notice */}
            <div className={styles.safetyNotice}>
                <AlertCircle size={20} />
                <div>
                    <strong>Medical Disclaimer:</strong> This tool provides general information based on available research.
                    Always consult a healthcare professional before combining compounds.
                </div>
            </div>

            {/* Compound Selection */}
            <div className={styles.selectionSection}>
                <div className={styles.sectionHeader}>
                    <h2>Selected Compounds</h2>
                    {selectedCompounds.length > 0 && (
                        <button className={styles.clearBtn} onClick={clearAll}>
                            Clear All
                        </button>
                    )}
                </div>

                <div className={styles.selectedCompounds}>
                    {selectedCompounds.map((compound, index) => (
                        <React.Fragment key={compound}>
                            <div className={styles.compoundTag}>
                                <span>{compound}</span>
                                <button onClick={() => removeCompound(compound)}>
                                    <X size={14} />
                                </button>
                            </div>
                            {index < selectedCompounds.length - 1 && (
                                <span className={styles.plusIcon}><Plus size={16} /></span>
                            )}
                        </React.Fragment>
                    ))}
                    <button
                        className={styles.addCompoundBtn}
                        onClick={() => setShowSearch(true)}
                    >
                        <Plus size={18} />
                        Add Compound
                    </button>
                </div>

                {/* Search Dropdown */}
                {showSearch && (
                    <div className={styles.searchDropdown}>
                        <div className={styles.searchInputWrapper}>
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search peptides..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button onClick={() => setShowSearch(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {searchResults.map(peptide => (
                                    <button
                                        key={peptide}
                                        className={styles.searchResult}
                                        onClick={() => addCompound(peptide)}
                                    >
                                        {peptide}
                                        <Plus size={16} />
                                    </button>
                                ))}
                            </div>
                        )}
                        {searchQuery && searchResults.length === 0 && (
                            <div className={styles.noResults}>
                                No peptides found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Select */}
                {selectedCompounds.length === 0 && (
                    <div className={styles.quickSelect}>
                        <p>Quick select a common stack:</p>
                        <div className={styles.quickStacks}>
                            {commonStacks.map(stack => (
                                <button
                                    key={stack.name}
                                    className={styles.quickStackBtn}
                                    onClick={() => setSelectedCompounds(stack.compounds)}
                                >
                                    {stack.name}
                                    <ChevronRight size={16} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {selectedCompounds.length >= 2 && (
                <div className={styles.resultsSection}>
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.loadingSpinner} />
                            <p>Checking interactions...</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Card */}
                            {summary && (
                                <div className={`${styles.summaryCard} ${summary.hasWarnings ? styles.hasWarnings : styles.safe}`}>
                                    <div className={styles.summaryIcon}>
                                        {summary.hasWarnings ? (
                                            <AlertTriangle size={32} />
                                        ) : (
                                            <Check size={32} />
                                        )}
                                    </div>
                                    <div className={styles.summaryContent}>
                                        <h3>
                                            {summary.hasWarnings
                                                ? 'Potential Interactions Found'
                                                : 'No Major Interactions Detected'}
                                        </h3>
                                        <p>
                                            {summary.hasWarnings
                                                ? `Found ${summary.avoid} avoid, ${summary.caution} caution, ${summary.synergy} synergy interactions`
                                                : `${summary.synergy} synergistic combinations found`}
                                        </p>
                                    </div>
                                    <div className={styles.summaryStats}>
                                        {summary.avoid > 0 && (
                                            <div className={styles.statBadge} style={{ background: INTERACTION_TYPES.avoid.bgColor, color: INTERACTION_TYPES.avoid.color }}>
                                                <AlertTriangle size={16} /> {summary.avoid} Avoid
                                            </div>
                                        )}
                                        {summary.caution > 0 && (
                                            <div className={styles.statBadge} style={{ background: INTERACTION_TYPES.caution.bgColor, color: INTERACTION_TYPES.caution.color }}>
                                                <AlertCircle size={16} /> {summary.caution} Caution
                                            </div>
                                        )}
                                        {summary.synergy > 0 && (
                                            <div className={styles.statBadge} style={{ background: INTERACTION_TYPES.synergy.bgColor, color: INTERACTION_TYPES.synergy.color }}>
                                                <Zap size={16} /> {summary.synergy} Synergy
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Interaction Details */}
                            {interactions.length > 0 ? (
                                <div className={styles.interactionsList}>
                                    <h3>Interaction Details</h3>
                                    {interactions.map((interaction, idx) => {
                                        const typeInfo = INTERACTION_TYPES[interaction.interaction_type];
                                        const severityInfo = interaction.severity ? SEVERITY_LEVELS[interaction.severity] : null;

                                        return (
                                            <div
                                                key={idx}
                                                className={styles.interactionCard}
                                                style={{ borderLeftColor: typeInfo?.color }}
                                            >
                                                <div className={styles.interactionHeader}>
                                                    <div
                                                        className={styles.interactionType}
                                                        style={{ background: typeInfo?.bgColor, color: typeInfo?.color }}
                                                    >
                                                        {getInteractionIcon(interaction.interaction_type)}
                                                        <span>{typeInfo?.label}</span>
                                                    </div>
                                                    {severityInfo && (
                                                        <span
                                                            className={styles.severityBadge}
                                                            style={{ color: severityInfo.color }}
                                                        >
                                                            {severityInfo.label} Severity
                                                        </span>
                                                    )}
                                                </div>

                                                <div className={styles.interactionPair}>
                                                    <Link
                                                        to={`/encyclopedia/${encodeURIComponent(interaction.compound_a)}`}
                                                        className={styles.compoundLink}
                                                    >
                                                        {interaction.compound_a}
                                                    </Link>
                                                    <span className={styles.pairDivider}>
                                                        {interaction.interaction_type === 'synergy' ? <Plus size={14} /> : <Minus size={14} />}
                                                    </span>
                                                    <Link
                                                        to={`/encyclopedia/${encodeURIComponent(interaction.compound_b)}`}
                                                        className={styles.compoundLink}
                                                    >
                                                        {interaction.compound_b}
                                                    </Link>
                                                </div>

                                                <p className={styles.interactionDescription}>
                                                    {interaction.description}
                                                </p>

                                                {interaction.mechanism && (
                                                    <div className={styles.mechanism}>
                                                        <strong>Mechanism:</strong> {interaction.mechanism}
                                                    </div>
                                                )}

                                                {interaction.recommendations?.length > 0 && (
                                                    <div className={styles.recommendations}>
                                                        <strong>Recommendations:</strong>
                                                        <ul>
                                                            {interaction.recommendations.map((rec, i) => (
                                                                <li key={i}>{rec}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={styles.noInteractions}>
                                    <Check size={48} />
                                    <h3>No Known Interactions</h3>
                                    <p>
                                        No documented interactions found between these compounds.
                                        This doesn't guarantee safety - always proceed with caution.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Empty State */}
            {selectedCompounds.length < 2 && (
                <div className={styles.emptyState}>
                    <Shield size={48} />
                    <h3>Select at least 2 compounds to check</h3>
                    <p>Add peptides above to see potential interactions and recommendations</p>
                </div>
            )}
        </div>
    );
};

export default InteractionChecker;
