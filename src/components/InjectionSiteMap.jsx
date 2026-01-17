import React, { useState } from 'react';
import styles from './InjectionSiteMap.module.css';

const injectionSites = {
    subcutaneous: [
        {
            id: 'abdomen',
            name: 'Abdomen',
            x: 50, y: 44,
            description: 'Most common site. 2 inches from navel.',
            tips: ['Rotate within a 2-inch radius', 'Pinch skin before injecting', 'Avoid scar tissue'],
            peptides: ['Semaglutide', 'Tirzepatide', 'BPC-157', 'Most peptides'],
            difficulty: 'Easy'
        },
        {
            id: 'thigh-front-left',
            name: 'Front Thigh (Left)',
            x: 44, y: 72,
            description: 'Middle third of outer thigh.',
            tips: ['Sit down for easier access', 'Inject into fatty area', 'Alternate legs'],
            peptides: ['All subcutaneous peptides'],
            difficulty: 'Easy'
        },
        {
            id: 'thigh-front-right',
            name: 'Front Thigh (Right)',
            x: 56, y: 72,
            description: 'Middle third of outer thigh.',
            tips: ['Sit down for easier access', 'Inject into fatty area', 'Alternate legs'],
            peptides: ['All subcutaneous peptides'],
            difficulty: 'Easy'
        },
        {
            id: 'upper-arm-left',
            name: 'Upper Arm (Left)',
            x: 26, y: 34,
            description: 'Back of upper arm, tricep area.',
            tips: ['May need assistance', 'Pinch skin firmly', 'Good for thin individuals'],
            peptides: ['GLP-1 agonists', 'Growth hormone peptides'],
            difficulty: 'Moderate'
        },
        {
            id: 'upper-arm-right',
            name: 'Upper Arm (Right)',
            x: 74, y: 34,
            description: 'Back of upper arm, tricep area.',
            tips: ['May need assistance', 'Pinch skin firmly', 'Good for thin individuals'],
            peptides: ['GLP-1 agonists', 'Growth hormone peptides'],
            difficulty: 'Moderate'
        },
        {
            id: 'love-handle-left',
            name: 'Flank/Love Handle (Left)',
            x: 36, y: 46,
            description: 'Side of abdomen/waist area.',
            tips: ['Good alternative to abdomen', 'Rotate with other sites'],
            peptides: ['All subcutaneous peptides'],
            difficulty: 'Easy'
        },
        {
            id: 'love-handle-right',
            name: 'Flank/Love Handle (Right)',
            x: 64, y: 46,
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
            x: 28, y: 26,
            description: 'Side of shoulder muscle.',
            tips: ['Locate 2-3 finger widths below acromion', 'Small volume only (1-2ml)', 'Relax arm'],
            peptides: ['TB-500', 'IGF-1', 'Some GH peptides'],
            difficulty: 'Moderate'
        },
        {
            id: 'deltoid-right',
            name: 'Deltoid (Right)',
            x: 72, y: 26,
            description: 'Side of shoulder muscle.',
            tips: ['Locate 2-3 finger widths below acromion', 'Small volume only (1-2ml)', 'Relax arm'],
            peptides: ['TB-500', 'IGF-1', 'Some GH peptides'],
            difficulty: 'Moderate'
        },
        {
            id: 'glute-left',
            name: 'Gluteus (Left)',
            x: 40, y: 56,
            description: 'Upper outer quadrant of buttock.',
            tips: ['Largest muscle - can handle larger volumes', 'Stand with weight on opposite leg', 'Locate upper outer quadrant'],
            peptides: ['TB-500', 'Large volume injections'],
            difficulty: 'Moderate'
        },
        {
            id: 'glute-right',
            name: 'Gluteus (Right)',
            x: 60, y: 56,
            description: 'Upper outer quadrant of buttock.',
            tips: ['Largest muscle - can handle larger volumes', 'Stand with weight on opposite leg', 'Locate upper outer quadrant'],
            peptides: ['TB-500', 'Large volume injections'],
            difficulty: 'Moderate'
        },
        {
            id: 'vastus-left',
            name: 'Vastus Lateralis (Left)',
            x: 42, y: 68,
            description: 'Outer middle thigh.',
            tips: ['Divide thigh into thirds, use middle third', 'Easy to self-administer', 'Can handle moderate volumes'],
            peptides: ['Growth factors', 'MGF for local effect'],
            difficulty: 'Easy'
        },
        {
            id: 'vastus-right',
            name: 'Vastus Lateralis (Right)',
            x: 58, y: 68,
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
                    {/* Body outline SVG */}
                    <svg viewBox="0 0 100 100" className={styles.bodySvg}>
                        {/* Anatomically Accurate Human Body Figure */}
                        <defs>
                            {/* Gradient for body shading */}
                            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                                <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
                            </linearGradient>
                        </defs>

                        <g className={styles.bodyGroup}>
                            {/* Head */}
                            <ellipse cx="50" cy="8" rx="5.5" ry="6.5" className={styles.bodyOutline} />

                            {/* Neck */}
                            <path d="M 47 14 L 47 17 L 53 17 L 53 14" className={styles.bodyOutline} />

                            {/* Torso - Anatomically shaped */}
                            <path
                                d="M 47 17 
                                   C 40 18, 36 21, 35 24
                                   L 34 28
                                   C 33 32, 33 38, 34 42
                                   L 35 50
                                   C 36 54, 38 56, 40 58
                                   L 42 58
                                   L 42 60
                                   L 43 62
                                   L 50 62
                                   L 57 62
                                   L 58 60
                                   L 58 58
                                   L 60 58
                                   C 62 56, 64 54, 65 50
                                   L 66 42
                                   C 67 38, 67 32, 66 28
                                   L 65 24
                                   C 64 21, 60 18, 53 17
                                   Z"
                                className={styles.bodyOutline}
                                fill="url(#bodyGradient)"
                            />

                            {/* Chest/Pec lines */}
                            <path d="M 42 24 Q 50 28, 58 24" className={styles.bodyDetail} />
                            <path d="M 43 28 Q 50 30, 57 28" className={styles.bodyDetail} />

                            {/* Abs lines */}
                            <line x1="50" y1="32" x2="50" y2="52" className={styles.bodyDetail} />
                            <path d="M 45 36 L 55 36" className={styles.bodyDetail} />
                            <path d="M 44 42 L 56 42" className={styles.bodyDetail} />
                            <path d="M 44 48 L 56 48" className={styles.bodyDetail} />

                            {/* Left Arm */}
                            <path
                                d="M 35 24
                                   C 32 25, 28 26, 25 28
                                   L 22 32
                                   C 19 36, 16 42, 15 48
                                   L 17 48
                                   C 18 44, 20 39, 22 36
                                   L 24 33
                                   C 26 30, 29 28, 32 27
                                   L 34 28
                                   Z"
                                className={styles.bodyOutline}
                            />
                            {/* Left forearm */}
                            <path
                                d="M 15 48 L 13 52 L 11 58 L 10 62 L 12 63 L 15 58 L 17 52 L 17 48 Z"
                                className={styles.bodyOutline}
                            />

                            {/* Right Arm */}
                            <path
                                d="M 65 24
                                   C 68 25, 72 26, 75 28
                                   L 78 32
                                   C 81 36, 84 42, 85 48
                                   L 83 48
                                   C 82 44, 80 39, 78 36
                                   L 76 33
                                   C 74 30, 71 28, 68 27
                                   L 66 28
                                   Z"
                                className={styles.bodyOutline}
                            />
                            {/* Right forearm */}
                            <path
                                d="M 85 48 L 87 52 L 89 58 L 90 62 L 88 63 L 85 58 L 83 52 L 83 48 Z"
                                className={styles.bodyOutline}
                            />

                            {/* Left Leg */}
                            <path
                                d="M 43 62
                                   L 42 68
                                   L 40 78
                                   L 38 88
                                   L 36 96
                                   L 42 96
                                   L 44 88
                                   L 46 78
                                   L 48 68
                                   L 50 62
                                   Z"
                                className={styles.bodyOutline}
                            />

                            {/* Right Leg */}
                            <path
                                d="M 57 62
                                   L 58 68
                                   L 60 78
                                   L 62 88
                                   L 64 96
                                   L 58 96
                                   L 56 88
                                   L 54 78
                                   L 52 68
                                   L 50 62
                                   Z"
                                className={styles.bodyOutline}
                            />

                            {/* Leg muscle definition lines */}
                            <path d="M 44 70 L 44 82" className={styles.bodyDetail} />
                            <path d="M 56 70 L 56 82" className={styles.bodyDetail} />
                        </g>

                        {/* Injection site markers */}
                        {sites.map((site) => (
                            <g key={site.id} onClick={() => handleSiteClick(site)} className={styles.siteMarker}>
                                <circle
                                    cx={site.x}
                                    cy={site.y}
                                    r={selectedSite?.id === site.id ? 4 : 3}
                                    className={`${styles.siteDot} ${selectedSite?.id === site.id ? styles.selected : ''}`}
                                />
                                <circle
                                    cx={site.x}
                                    cy={site.y}
                                    r={8}
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
