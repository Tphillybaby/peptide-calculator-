import React, { useState } from 'react';
import styles from './InjectionSiteMap.module.css';

const injectionSites = {
    subcutaneous: [
        {
            id: 'abdomen',
            name: 'Abdomen',
            x: 100, y: 155,
            description: 'Most common site. 2 inches from navel.',
            tips: ['Rotate within a 2-inch radius', 'Pinch skin before injecting', 'Avoid scar tissue'],
            peptides: ['Semaglutide', 'Tirzepatide', 'BPC-157', 'Most peptides'],
            difficulty: 'Easy'
        },
        {
            id: 'thigh-front-left',
            name: 'Front Thigh (Left)',
            x: 75, y: 290,
            description: 'Middle third of outer thigh.',
            tips: ['Sit down for easier access', 'Inject into fatty area', 'Alternate legs'],
            peptides: ['All subcutaneous peptides'],
            difficulty: 'Easy'
        },
        {
            id: 'thigh-front-right',
            name: 'Front Thigh (Right)',
            x: 125, y: 290,
            description: 'Middle third of outer thigh.',
            tips: ['Sit down for easier access', 'Inject into fatty area', 'Alternate legs'],
            peptides: ['All subcutaneous peptides'],
            difficulty: 'Easy'
        },
        {
            id: 'upper-arm-left',
            name: 'Upper Arm (Left)',
            x: 38, y: 160,
            description: 'Back of upper arm, tricep area.',
            tips: ['May need assistance', 'Pinch skin firmly', 'Good for thin individuals'],
            peptides: ['GLP-1 agonists', 'Growth hormone peptides'],
            difficulty: 'Moderate'
        },
        {
            id: 'upper-arm-right',
            name: 'Upper Arm (Right)',
            x: 162, y: 160,
            description: 'Back of upper arm, tricep area.',
            tips: ['May need assistance', 'Pinch skin firmly', 'Good for thin individuals'],
            peptides: ['GLP-1 agonists', 'Growth hormone peptides'],
            difficulty: 'Moderate'
        },
        {
            id: 'love-handle-left',
            name: 'Flank/Love Handle (Left)',
            x: 68, y: 170,
            description: 'Side of abdomen/waist area.',
            tips: ['Good alternative to abdomen', 'Rotate with other sites'],
            peptides: ['All subcutaneous peptides'],
            difficulty: 'Easy'
        },
        {
            id: 'love-handle-right',
            name: 'Flank/Love Handle (Right)',
            x: 132, y: 170,
            description: 'Side of abdomen/waist area.',
            tips: ['Good alternative to abdomen', 'Rotate with other sites'],
            peptides: ['All subcutaneous peptides'],
            difficulty: 'Easy'
        }
    ],
    intramuscular: [
        {
            id: 'deltoid-left',
            name: 'Deltoid (Left)',
            x: 52, y: 95,
            description: 'Side of shoulder muscle.',
            tips: ['Locate 2-3 finger widths below acromion', 'Small volume only (1-2ml)', 'Relax arm'],
            peptides: ['TB-500', 'IGF-1', 'Some GH peptides'],
            difficulty: 'Moderate'
        },
        {
            id: 'deltoid-right',
            name: 'Deltoid (Right)',
            x: 148, y: 95,
            description: 'Side of shoulder muscle.',
            tips: ['Locate 2-3 finger widths below acromion', 'Small volume only (1-2ml)', 'Relax arm'],
            peptides: ['TB-500', 'IGF-1', 'Some GH peptides'],
            difficulty: 'Moderate'
        },
        {
            id: 'glute-left',
            name: 'Gluteus (Left)',
            x: 72, y: 195,
            description: 'Upper outer quadrant of buttock.',
            tips: ['Largest muscle - can handle larger volumes', 'Stand with weight on opposite leg', 'Locate upper outer quadrant'],
            peptides: ['TB-500', 'Large volume injections'],
            difficulty: 'Moderate'
        },
        {
            id: 'glute-right',
            name: 'Gluteus (Right)',
            x: 128, y: 195,
            description: 'Upper outer quadrant of buttock.',
            tips: ['Largest muscle - can handle larger volumes', 'Stand with weight on opposite leg', 'Locate upper outer quadrant'],
            peptides: ['TB-500', 'Large volume injections'],
            difficulty: 'Moderate'
        },
        {
            id: 'vastus-left',
            name: 'Vastus Lateralis (Left)',
            x: 65, y: 270,
            description: 'Outer middle thigh.',
            tips: ['Divide thigh into thirds, use middle third', 'Easy to self-administer', 'Can handle moderate volumes'],
            peptides: ['Growth factors', 'MGF for local effect'],
            difficulty: 'Easy'
        },
        {
            id: 'vastus-right',
            name: 'Vastus Lateralis (Right)',
            x: 135, y: 270,
            description: 'Outer middle thigh.',
            tips: ['Divide thigh into thirds, use middle third', 'Easy to self-administer', 'Can handle moderate volumes'],
            peptides: ['Growth factors', 'MGF for local effect'],
            difficulty: 'Easy'
        }
    ]
};

const InjectionSiteMap = () => {
    const [selectedType, setSelectedType] = useState('subcutaneous');
    const [selectedSite, setSelectedSite] = useState(null);

    const sites = injectionSites[selectedType] || [];

    const handleSiteClick = (site) => {
        setSelectedSite(site);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'var(--success)';
            case 'Moderate': return 'var(--warning)';
            case 'Advanced': return 'var(--error)';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Injection Site Guide</h1>
                <p className={styles.subtitle}>
                    Interactive guide to safe injection sites for peptide administration
                </p>
            </div>

            <div className={styles.controls}>
                <div className={styles.typeToggle}>
                    <button
                        className={`${styles.toggleBtn} ${selectedType === 'subcutaneous' ? styles.active : ''}`}
                        onClick={() => setSelectedType('subcutaneous')}
                    >
                        Subcutaneous (SubQ)
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${selectedType === 'intramuscular' ? styles.active : ''}`}
                        onClick={() => setSelectedType('intramuscular')}
                    >
                        Intramuscular (IM)
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.bodyContainer}>
                    {/* Body outline SVG */}
                    <svg viewBox="0 0 200 400" className={styles.bodySvg}>
                        {/* Clean Human Body Silhouette */}
                        <defs>
                            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
                                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.25)" />
                                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.15)" />
                            </linearGradient>
                            <linearGradient id="bodyStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
                                <stop offset="100%" stopColor="rgba(6, 182, 212, 0.5)" />
                            </linearGradient>
                        </defs>

                        <g className={styles.bodyGroup}>
                            {/* Head */}
                            <ellipse cx="100" cy="30" rx="22" ry="26"
                                fill="url(#bodyGradient)"
                                stroke="url(#bodyStroke)"
                                strokeWidth="2" />

                            {/* Neck */}
                            <path d="M 90 54 L 90 70 L 110 70 L 110 54"
                                fill="url(#bodyGradient)"
                                stroke="url(#bodyStroke)"
                                strokeWidth="2" />

                            {/* Shoulders and Torso */}
                            <path d="
                                M 90 70
                                L 55 78
                                Q 45 82, 42 95
                                L 42 115
                                L 50 115
                                L 50 100
                                Q 52 90, 60 86
                                L 70 84
                                L 70 180
                                Q 68 190, 65 200
                                L 65 205
                                L 135 205
                                L 135 200
                                Q 132 190, 130 180
                                L 130 84
                                L 140 86
                                Q 148 90, 150 100
                                L 150 115
                                L 158 115
                                L 158 95
                                Q 155 82, 145 78
                                L 110 70
                                Z"
                                fill="url(#bodyGradient)"
                                stroke="url(#bodyStroke)"
                                strokeWidth="2"
                            />

                            {/* Left Arm */}
                            <path d="
                                M 42 115
                                Q 38 130, 35 150
                                L 32 180
                                Q 30 195, 28 210
                                L 38 212
                                Q 42 200, 45 185
                                L 48 160
                                Q 50 140, 50 115
                                Z"
                                fill="url(#bodyGradient)"
                                stroke="url(#bodyStroke)"
                                strokeWidth="2"
                            />

                            {/* Right Arm */}
                            <path d="
                                M 158 115
                                Q 162 130, 165 150
                                L 168 180
                                Q 170 195, 172 210
                                L 162 212
                                Q 158 200, 155 185
                                L 152 160
                                Q 150 140, 150 115
                                Z"
                                fill="url(#bodyGradient)"
                                stroke="url(#bodyStroke)"
                                strokeWidth="2"
                            />

                            {/* Left Leg */}
                            <path d="
                                M 65 205
                                L 62 250
                                L 58 300
                                L 55 350
                                Q 54 365, 52 380
                                L 75 380
                                Q 78 365, 80 350
                                L 85 300
                                L 90 250
                                L 100 205
                                Z"
                                fill="url(#bodyGradient)"
                                stroke="url(#bodyStroke)"
                                strokeWidth="2"
                            />

                            {/* Right Leg */}
                            <path d="
                                M 135 205
                                L 138 250
                                L 142 300
                                L 145 350
                                Q 146 365, 148 380
                                L 125 380
                                Q 122 365, 120 350
                                L 115 300
                                L 110 250
                                L 100 205
                                Z"
                                fill="url(#bodyGradient)"
                                stroke="url(#bodyStroke)"
                                strokeWidth="2"
                            />
                        </g>

                        {/* Injection site markers */}
                        {sites.map((site) => (
                            <g key={site.id} onClick={() => handleSiteClick(site)} className={styles.siteMarker}>
                                <circle
                                    cx={site.x}
                                    cy={site.y}
                                    r={selectedSite?.id === site.id ? 12 : 10}
                                    className={`${styles.siteDot} ${selectedSite?.id === site.id ? styles.selected : ''}`}
                                />
                                <circle
                                    cx={site.x}
                                    cy={site.y}
                                    r={20}
                                    className={styles.siteHitArea}
                                />
                            </g>
                        ))}
                    </svg>

                    {/* Site labels */}
                    <div className={styles.siteLabels}>
                        {sites.map((site) => (
                            <button
                                key={site.id}
                                className={`${styles.siteLabel} ${selectedSite?.id === site.id ? styles.active : ''}`}
                                onClick={() => handleSiteClick(site)}
                            >
                                {site.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.infoPanel}>
                    {selectedSite ? (
                        <>
                            <div className={styles.siteHeader}>
                                <h2 className={styles.siteName}>{selectedSite.name}</h2>
                                <span
                                    className={styles.difficulty}
                                    style={{ color: getDifficultyColor(selectedSite.difficulty) }}
                                >
                                    {selectedSite.difficulty}
                                </span>
                            </div>

                            <p className={styles.siteDescription}>{selectedSite.description}</p>

                            <div className={styles.section}>
                                <h3>Injection Tips</h3>
                                <ul className={styles.tipsList}>
                                    {selectedSite.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.section}>
                                <h3>Recommended For</h3>
                                <div className={styles.peptideTags}>
                                    {selectedSite.peptides.map((peptide, i) => (
                                        <span key={i} className={styles.peptideTag}>{peptide}</span>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3>Administration Type</h3>
                                <p className={styles.adminType}>
                                    {selectedType === 'subcutaneous'
                                        ? '💉 Subcutaneous - Into fatty tissue layer beneath skin'
                                        : '💪 Intramuscular - Into the muscle tissue'}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className={styles.placeholder}>
                            <div className={styles.placeholderIcon}>👆</div>
                            <p>Click on a site marker to view detailed injection information</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.legend}>
                <h3>General Guidelines</h3>
                <div className={styles.guidelines}>
                    <div className={styles.guideline}>
                        <span className={styles.guideIcon}>🔄</span>
                        <span>Rotate injection sites to prevent lipodystrophy</span>
                    </div>
                    <div className={styles.guideline}>
                        <span className={styles.guideIcon}>🧴</span>
                        <span>Clean site with alcohol swab before injection</span>
                    </div>
                    <div className={styles.guideline}>
                        <span className={styles.guideIcon}>📏</span>
                        <span>SubQ: 1/2" needle at 45° | IM: 1-1.5" needle at 90°</span>
                    </div>
                    <div className={styles.guideline}>
                        <span className={styles.guideIcon}>⚠️</span>
                        <span>Avoid injecting into bruised, scarred, or irritated skin</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InjectionSiteMap;
