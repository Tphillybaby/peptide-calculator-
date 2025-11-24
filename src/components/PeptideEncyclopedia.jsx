import React, { useEffect, useMemo, useState } from 'react';
import {
    Activity,
    BookOpen,
    ExternalLink,
    Filter,
    FlaskConical,
    Info,
    Search,
    ShieldCheck,
    TestTube,
    Thermometer
} from 'lucide-react';
import { PEPTIDE_DATABASE } from '../data/peptideDatabase';
import styles from './PeptideEncyclopedia.module.css';

const PeptideEncyclopedia = () => {
    const peptides = useMemo(() => Object.values(PEPTIDE_DATABASE), []);
    const categories = useMemo(() => ['All', ...new Set(peptides.map((p) => p.category))], [peptides]);

    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const [selectedPeptide, setSelectedPeptide] = useState(peptides[0]);

    const filteredPeptides = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return peptides.filter((peptide) => {
            const matchesSearch =
                peptide.name.toLowerCase().includes(term) ||
                peptide.description.toLowerCase().includes(term) ||
                peptide.category.toLowerCase().includes(term);
            const matchesCategory = category === 'All' || peptide.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [category, peptides, searchTerm]);

    useEffect(() => {
        if (!filteredPeptides.length) return;
        const current = filteredPeptides.find((p) => p.name === selectedPeptide?.name);
        if (!current) {
            setSelectedPeptide(filteredPeptides[0]);
        }
    }, [filteredPeptides, selectedPeptide]);

    const researchLinksCount = useMemo(
        () => peptides.reduce((total, peptide) => total + (peptide.researchLinks?.length || 0), 0),
        [peptides]
    );

    const protocols = selectedPeptide?.protocols || [];
    const cons = selectedPeptide?.cons || [];

    return (
        <div className={styles.container}>
            <section className={styles.hero}>
                <div className={styles.heroIcon}>
                    <BookOpen size={32} />
                </div>
                <div>
                    <p className={styles.eyebrow}>Reference</p>
                    <h1 className={styles.title}>Peptide Encyclopedia</h1>
                    <p className={styles.subtitle}>
                        Fast lookups for half-life, dosing ranges, benefits, risks, and research links.
                    </p>
                </div>
                <div className={styles.heroStats}>
                    <div className={styles.stat}>
                        <span>Total peptides</span>
                        <strong>{peptides.length}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>Categories</span>
                        <strong>{categories.length - 1}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>Research links</span>
                        <strong>{researchLinksCount}</strong>
                    </div>
                </div>
            </section>

            <div className={styles.controls}>
                <div className={styles.search}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, use-case, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search peptides"
                    />
                </div>
                <div className={styles.filter}>
                    <Filter size={18} />
                    <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterResult}>
                    <span>{filteredPeptides.length} peptides</span>
                    <span className={styles.dot} />
                    <span>click a card to inspect</span>
                </div>
            </div>

            <div className={styles.layout}>
                <div className={styles.listColumn}>
                    <div className={styles.peptideGrid}>
                        {filteredPeptides.map((peptide) => (
                            <button
                                key={peptide.name}
                                className={`${styles.peptideCard} ${
                                    selectedPeptide?.name === peptide.name ? styles.activeCard : ''
                                }`}
                                onClick={() => setSelectedPeptide(peptide)}
                            >
                                <div className={styles.cardHeader}>
                                    <div>
                                        <p className={styles.cardCategory}>{peptide.category}</p>
                                        <h3>{peptide.name}</h3>
                                    </div>
                                    <Activity size={18} />
                                </div>
                                <p className={styles.cardDescription}>{peptide.description}</p>
                                <div className={styles.cardMeta}>
                                    <span>
                                        <Thermometer size={16} />
                                        {peptide.halfLife}
                                    </span>
                                    <span>
                                        <TestTube size={16} />
                                        {peptide.commonDosage}
                                    </span>
                                </div>
                                <div className={styles.tags}>
                                    {(peptide.benefits || []).slice(0, 3).map((benefit) => (
                                        <span key={benefit}>{benefit}</span>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedPeptide && (
                    <div className={styles.detailColumn}>
                        <div className={`glass-panel ${styles.detailCard}`}>
                            <div className={styles.detailHeader}>
                                <div>
                                    <p className={styles.cardCategory}>{selectedPeptide.category}</p>
                                    <h2>{selectedPeptide.name}</h2>
                                </div>
                                <div className={styles.pills}>
                                    <span>
                                        <Thermometer size={16} />
                                        {selectedPeptide.halfLife}
                                    </span>
                                    <span>
                                        <TestTube size={16} />
                                        {selectedPeptide.commonDosage}
                                    </span>
                                </div>
                            </div>

                            <p className={styles.detailDescription}>{selectedPeptide.description}</p>

                            <div className={styles.detailMeta}>
                                <div>
                                    <FlaskConical size={18} />
                                    <div>
                                        <p className={styles.label}>Administration</p>
                                        <p>{selectedPeptide.administration}</p>
                                    </div>
                                </div>
                                <div>
                                    <ShieldCheck size={18} />
                                    <div>
                                        <p className={styles.label}>Storage</p>
                                        <p>{selectedPeptide.storage}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.columns}>
                                <div>
                                    <p className={styles.label}>Benefits</p>
                                    <ul>
                                        {(selectedPeptide.benefits || []).map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className={styles.label}>Side Effects</p>
                                    <ul>
                                        {(selectedPeptide.sideEffects || []).map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className={styles.label}>Cons</p>
                                    <ul>
                                        {cons.length > 0 ? cons.map((item) => (
                                            <li key={item}>{item}</li>
                                        )) : <li>No major cons listed.</li>}
                                    </ul>
                                </div>
                                <div>
                                    <p className={styles.label}>Warnings</p>
                                    <ul>
                                        {(selectedPeptide.warnings || []).map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {protocols.length > 0 && (
                                <div className={styles.protocols}>
                                    <div className={styles.protocolHeader}>
                                        <h4>Protocols</h4>
                                        <span>{protocols.length} available</span>
                                    </div>
                                    <div className={styles.protocolList}>
                                        {protocols.map((protocol) => (
                                            <div key={protocol.name} className={styles.protocolCard}>
                                                <div className={styles.protocolTitle}>
                                                    <div>
                                                        <p className={styles.cardCategory}>{protocol.level}</p>
                                                        <h5>{protocol.name}</h5>
                                                    </div>
                                                    <p className={styles.protocolDuration}>{protocol.duration}</p>
                                                </div>
                                                <p className={styles.protocolDescription}>{protocol.description}</p>
                                                <div className={styles.schedule}>
                                                    {protocol.schedule.map((step) => (
                                                        <div key={`${protocol.name}-${step.week}`} className={styles.scheduleItem}>
                                                            <div className={styles.scheduleWeek}>{step.week}</div>
                                                            <div className={styles.scheduleDetails}>
                                                                <p className={styles.scheduleDose}>{step.dose}</p>
                                                                <p className={styles.scheduleFrequency}>{step.frequency}</p>
                                                                {step.notes && <p className={styles.scheduleNotes}>{step.notes}</p>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {protocol.notes && <p className={styles.protocolNotes}>{protocol.notes}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.research}>
                                <div className={styles.researchHeader}>
                                    <h4>Research Links</h4>
                                    <Info size={16} />
                                </div>
                                <div className={styles.researchList}>
                                    {(selectedPeptide.researchLinks || []).map((link) => (
                                        <a
                                            key={link}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.researchLink}
                                        >
                                            <ExternalLink size={14} />
                                            {link}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.callout}>
                                <ShieldCheck size={18} />
                                <div>
                                    <p className={styles.calloutTitle}>For research reference only</p>
                                    <p className={styles.calloutBody}>
                                        Consult medical guidance before use. This library summarizes published data and common protocols,
                                        and is not a substitute for professional advice.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PeptideEncyclopedia;
