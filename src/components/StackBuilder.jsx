import React, { useState, useMemo } from 'react';
import {
    Plus, X, AlertTriangle, CheckCircle, Zap, Info,
    Search, Beaker, ArrowRight, RotateCcw, Lock
} from 'lucide-react';
import { INTERACTION_RULES, PEPTIDE_CATEGORIES } from '../data/interactions';
import UpgradeModal from './UpgradeModal';
import styles from './StackBuilder.module.css';

const ALL_PEPTIDES = Object.values(PEPTIDE_CATEGORIES).flat().sort();

const StackBuilder = ({ isPremium = false }) => {
    const [stack, setStack] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Normalize name for comparison
    const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const handleAdd = (peptide) => {
        if (!stack.some(p => p.id === peptide)) {
            setStack([...stack, { id: peptide, name: peptide }]);
        }
        setSearchTerm('');
    };

    const handleRemove = (id) => {
        setStack(stack.filter(p => p.id !== id));
    };

    const analysis = useMemo(() => {
        const results = [];
        const stackIds = stack.map(p => normalize(p.name));

        INTERACTION_RULES.forEach(rule => {
            let match = false;

            // Check "minMatches" type rules (e.g. 2+ GLP-1s)
            if (rule.peptides) {
                const count = rule.peptides.filter(p => stackIds.some(s => s.includes(p))).length;
                if (count >= rule.minMatches) match = true;
            }

            // Check "Group A + Group B" type rules (e.g. GHRH + GHRP)
            if (rule.groupA && rule.groupB) {
                const hasA = rule.groupA.some(a => stackIds.some(s => s.includes(a)));
                const hasB = rule.groupB.some(b => stackIds.some(s => s.includes(b)));
                if (hasA && hasB) match = true;
            }

            // Check "Required Specifics" type rules
            if (rule.required) {
                const allFound = rule.required.every(r => stackIds.some(s => s.includes(r)));
                if (allFound) match = true;
            }

            if (match) {
                results.push(rule);
            }
        });

        return results;
    }, [stack]);

    const filteredPeptides = ALL_PEPTIDES
        .filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => !stack.some(s => s.name === p));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Beaker size={32} className={styles.icon} />
                <div>
                    <h1 className={styles.title}>Peptide Stack Builder</h1>
                    <p className={styles.subtitle}>Design your protocol and check for interactions</p>
                </div>
            </div>

            <div className={styles.layout}>
                {/* Left Col: Builder */}
                <div className={styles.builderCol}>
                    <div className={styles.searchBox}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search peptide to add..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {searchTerm && (
                        <div className={styles.searchResults}>
                            {filteredPeptides.length > 0 ? (
                                filteredPeptides.map(p => (
                                    <button key={p} className={styles.resultItem} onClick={() => handleAdd(p)}>
                                        <Plus size={16} /> {p}
                                    </button>
                                ))
                            ) : (
                                <div className={styles.noResults}>No matching peptides found</div>
                            )}
                        </div>
                    )}

                    <div className={styles.stackList}>
                        <h3>Your Stack ({stack.length})</h3>
                        {stack.length === 0 ? (
                            <div className={styles.emptyStack}>
                                <p>Your stack is empty.</p>
                                <span>Add peptides to see analysis.</span>
                            </div>
                        ) : (
                            <div className={styles.chips}>
                                {stack.map(item => (
                                    <div key={item.id} className={styles.chip}>
                                        {item.name}
                                        <button onClick={() => handleRemove(item.id)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {stack.length > 0 && (
                            <button className={styles.resetBtn} onClick={() => setStack([])}>
                                <RotateCcw size={14} /> Clear Stack
                            </button>
                        )}
                    </div>

                    <div className={styles.categories}>
                        <h4>Browse by Category</h4>
                        <div className={styles.catGrid}>
                            {Object.entries(PEPTIDE_CATEGORIES).map(([cat, peptides]) => (
                                <div key={cat} className={styles.catCard}>
                                    <h5>{cat}</h5>
                                    <div className={styles.catTags}>
                                        {peptides.map(p => (
                                            <button
                                                key={p}
                                                onClick={() => handleAdd(p)}
                                                disabled={stack.some(s => s.name === p)}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Col: Analysis */}
                <div className={styles.analysisCol}>
                    <h3>Stack Analysis</h3>

                    {!isPremium && stack.length >= 2 ? (
                        <div className={styles.premiumOverlay}>
                            <Lock size={48} className={styles.lockIcon} />
                            <h4>Premium Feature</h4>
                            <p>Upgrade to Pro to see detailed interaction analysis, synergies, and safety warnings for your custom stack.</p>
                            <button
                                className={styles.upgradeBtn}
                                onClick={() => setShowUpgradeModal(true)}
                            >
                                Upgrade to Unlock
                            </button>
                        </div>
                    ) : (
                        <>
                            {stack.length < 2 && stack.length > 0 && (
                                <div className={styles.infoCard}>
                                    <Info size={20} />
                                    <p>Add more peptides to check for interactions and synergies.</p>
                                </div>
                            )}

                            {analysis.length > 0 ? (
                                <div className={styles.resultsList}>
                                    {analysis.map((rule, idx) => (
                                        <div key={idx} className={`${styles.resultCard} ${styles[rule.type.toLowerCase()]}`}>
                                            <div className={styles.resultHeader}>
                                                {rule.type === 'WARNING' && <AlertTriangle size={20} />}
                                                {rule.type === 'SYNERGY' && <Zap size={20} />}
                                                {rule.type === 'INFO' && <Info size={20} />}
                                                <h4>{rule.title}</h4>
                                            </div>
                                            <p>{rule.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : stack.length >= 2 ? (
                                <div className={styles.safeCard}>
                                    <div className={styles.checkIcon}>
                                        <Zap size={24} />
                                    </div>
                                    <h4>No Known Interactions</h4>
                                    <p>We didn't detect any specific conflicts or well-known synergies for this combination.</p>
                                </div>
                            ) : null}
                        </>
                    )}

                    <div className={styles.disclaimer}>
                        <p>
                            <strong>Disclaimer:</strong> This tool provides general information based on common user protocols.
                            It is not medical advice. Peptides can have potent effects. Always consult a healthcare professional.
                        </p>
                    </div>
                </div>
            </div>
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </div>
    );
};

export default StackBuilder;
