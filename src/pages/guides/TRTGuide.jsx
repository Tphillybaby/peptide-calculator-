import React, { useState } from 'react';
import {
    ArrowLeft, Zap, Shield, AlertTriangle, CheckCircle, BookOpen,
    Activity, Heart, Brain, Clock, FlaskConical, TrendingUp,
    BarChart3, Syringe, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import styles from './TRTGuide.module.css';

// Accordion sub-component
const Accordion = ({ title, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={styles.accordion}>
            <button className={styles.accordionHeader} onClick={() => setOpen(o => !o)}>
                <span>{title}</span>
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {open && <div className={styles.accordionBody}>{children}</div>}
        </div>
    );
};

const TRTGuide = () => {
    return (
        <>
            <SEO
                title="TRT (Testosterone Replacement Therapy) — Complete Encyclopedia"
                description="Everything you need to know about Testosterone Replacement Therapy (TRT): protocols, dosages, esters, ancillaries, blood work, risks, and how to optimize your therapy."
                canonical="/guides/trt"
            />
            <div className="page-container">
                <div className={styles.container}>
                    <Link to="/guides" className={styles.backLink}>
                        <ArrowLeft size={20} /> Back to Guides
                    </Link>

                    {/* Hero */}
                    <div className={styles.hero}>
                        <div className={styles.heroIcon}>
                            <Zap size={32} />
                        </div>
                        <div className={styles.heroBadge}>Hormone Therapy</div>
                        <h1>Testosterone Replacement Therapy</h1>
                        <p className={styles.heroSubtitle}>
                            A comprehensive, evidence-based encyclopedia covering protocols, esters, ancillaries,
                            blood work, and everything you need to optimise your TRT safely.
                        </p>
                        <div className={styles.heroStats}>
                            <div className={styles.heroStat}>
                                <span className={styles.heroStatValue}>100–200 mg</span>
                                <span className={styles.heroStatLabel}>Typical weekly dose</span>
                            </div>
                            <div className={styles.heroStat}>
                                <span className={styles.heroStatValue}>4–8 weeks</span>
                                <span className={styles.heroStatLabel}>Time to stable levels</span>
                            </div>
                            <div className={styles.heroStat}>
                                <span className={styles.heroStatValue}>3–6 months</span>
                                <span className={styles.heroStatLabel}>Full benefit onset</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Reference Banner */}
                    <div className={styles.quickRef}>
                        <div className={styles.quickRefItem}>
                            <span className={styles.quickRefLabel}>Active Substance</span>
                            <span className={styles.quickRefValue}>Testosterone</span>
                        </div>
                        <div className={styles.quickRefItem}>
                            <span className={styles.quickRefLabel}>Classification</span>
                            <span className={styles.quickRefValue}>Anabolic Androgen</span>
                        </div>
                        <div className={styles.quickRefItem}>
                            <span className={styles.quickRefLabel}>Administration</span>
                            <span className={styles.quickRefValue}>IM / SubQ / Topical</span>
                        </div>
                        <div className={styles.quickRefItem}>
                            <span className={styles.quickRefLabel}>Half-Life (Cyp)</span>
                            <span className={styles.quickRefValue}>~8 days</span>
                        </div>
                    </div>

                    {/* What is TRT */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <BookOpen size={24} />
                            <h2>What Is TRT?</h2>
                        </div>

                        <div className={styles.contentBlock}>
                            <p>
                                <strong>Testosterone Replacement Therapy (TRT)</strong> is a medical treatment that
                                restores testosterone levels in men (or occasionally women) whose bodies do not produce
                                enough on their own — a condition called <strong>hypogonadism</strong>. Testosterone is
                                the primary male sex hormone and anabolic steroid, responsible for regulating libido,
                                bone density, fat distribution, muscle mass, red blood cell production, and overall
                                sense of wellbeing.
                            </p>
                        </div>

                        <div className={styles.contentBlock}>
                            <h3>Primary vs. Secondary Hypogonadism</h3>
                            <div className={styles.twoColumn}>
                                <div className={styles.infoCard} style={{ '--card-color': '#3b82f6' }}>
                                    <h4>Primary (Hypergonadotropic)</h4>
                                    <p>
                                        The testes fail to produce adequate testosterone despite normal LH/FSH signals
                                        from the pituitary. Causes include Klinefelter syndrome, orchitis, testicular
                                        injury, or chemotherapy.
                                    </p>
                                </div>
                                <div className={styles.infoCard} style={{ '--card-color': '#8b5cf6' }}>
                                    <h4>Secondary (Hypogonadotropic)</h4>
                                    <p>
                                        The pituitary gland fails to send proper signals to the testes. Causes include
                                        pituitary tumors, obesity, opioid use, anabolic steroid history, or idiopathic
                                        causes. More commonly treated with TRT or hCG monotherapy.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.infoBox}>
                            <div className={styles.infoBoxIcon}><Activity size={20} /></div>
                            <div>
                                <strong>Normal reference range:</strong> Total testosterone in adult males typically
                                falls between <strong>300–1,000 ng/dL</strong> (10–35 nmol/L), though optimal levels
                                for symptom relief often lie in the upper third (600–900 ng/dL). Free testosterone
                                (1–3% of total) is the biologically active fraction.
                            </div>
                        </div>
                    </section>

                    {/* Symptoms & Diagnosis */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Heart size={24} />
                            <h2>Symptoms & Diagnosis</h2>
                        </div>

                        <div className={styles.symptomsGrid}>
                            {[
                                { symptom: 'Low libido / sexual dysfunction', severity: 'high' },
                                { symptom: 'Fatigue & low energy', severity: 'high' },
                                { symptom: 'Depression & mood changes', severity: 'high' },
                                { symptom: 'Reduced muscle mass', severity: 'medium' },
                                { symptom: 'Increased body fat', severity: 'medium' },
                                { symptom: 'Brain fog / poor concentration', severity: 'medium' },
                                { symptom: 'Erectile dysfunction', severity: 'high' },
                                { symptom: 'Osteoporosis / low bone density', severity: 'medium' },
                                { symptom: 'Reduced body / facial hair', severity: 'low' },
                                { symptom: 'Hot flashes / sweating', severity: 'low' },
                                { symptom: 'Anaemia', severity: 'low' },
                                { symptom: 'Infertility', severity: 'medium' },
                            ].map(({ symptom, severity }) => (
                                <div key={symptom} className={`${styles.symptomBadge} ${styles[`severity_${severity}`]}`}>
                                    {symptom}
                                </div>
                            ))}
                        </div>

                        <div className={styles.contentBlock} style={{ marginTop: '1.5rem' }}>
                            <h3>Diagnosing Low Testosterone</h3>
                            <p>
                                Diagnosis requires <strong>two fasting morning blood tests</strong> (testosterone
                                peaks in the morning) taken at least 4 weeks apart showing consistently low levels,
                                combined with clinical symptoms. Do not rely on a single result.
                            </p>
                        </div>

                        <div className={styles.labTable}>
                            <div className={styles.labTableHeader}>
                                <span>Biomarker</span>
                                <span>Target / Purpose</span>
                                <span>When to Test</span>
                            </div>
                            {[
                                { marker: 'Total Testosterone', target: '600–900 ng/dL (on TRT)', when: 'Before starting; 6–8 wks after change' },
                                { marker: 'Free Testosterone', target: '>15–20 pg/mL', when: 'Same as total T' },
                                { marker: 'LH & FSH', target: 'Baseline only (suppressed on TRT)', when: 'Pre-TRT diagnosis' },
                                { marker: 'Oestradiol (E2)', target: '20–40 pg/mL', when: 'Every 3 months' },
                                { marker: 'Haematocrit (HCT)', target: '<52%', when: 'Every 3 months' },
                                { marker: 'PSA', target: '<4 ng/mL (age dependent)', when: 'Baseline; annually >40 yrs' },
                                { marker: 'Liver enzymes (ALT/AST)', target: 'Within normal range', when: 'Annually' },
                                { marker: 'SHBG', target: '10–50 nmol/L', when: 'Baseline; helps choose ester/freq' },
                                { marker: 'Lipid Panel', target: 'Normal ranges', when: 'Annually' },
                                { marker: 'CBC', target: 'Normal ranges', when: 'Every 3 months' },
                            ].map(({ marker, target, when }) => (
                                <div key={marker} className={styles.labTableRow}>
                                    <span className={styles.markerName}>{marker}</span>
                                    <span>{target}</span>
                                    <span className={styles.markerWhen}>{when}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Testosterone Esters */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <FlaskConical size={24} />
                            <h2>Testosterone Esters Explained</h2>
                        </div>

                        <div className={styles.contentBlock}>
                            <p>
                                All injectable testosterone esters are chemically identical once the ester chain is
                                cleaved in the body — only the <strong>release rate differs</strong>. Shorter esters
                                leave the bloodstream faster, allowing more frequent injections and stable levels.
                                Longer esters are more convenient but produce larger peaks and troughs.
                            </p>
                        </div>

                        <div className={styles.estersGrid}>
                            {[
                                {
                                    name: 'Testosterone Cypionate',
                                    halfLife: '~8 days',
                                    freq: 'Once or twice weekly',
                                    origin: 'USA standard',
                                    notes: 'Most commonly prescribed in North America. Very stable levels on twice-weekly pinning.',
                                    color: '#3b82f6',
                                },
                                {
                                    name: 'Testosterone Enanthate',
                                    halfLife: '~7 days',
                                    freq: 'Once or twice weekly',
                                    origin: 'Europe / worldwide',
                                    notes: 'Nearly identical to Cypionate. Standard in Europe. Interchangeable for most purposes.',
                                    color: '#8b5cf6',
                                },
                                {
                                    name: 'Testosterone Propionate',
                                    halfLife: '~2–3 days',
                                    freq: 'Every other day (EOD)',
                                    origin: 'Fast-acting',
                                    notes: 'Pinnacle of level stability. Requires more frequent injections. Preferred by those sensitive to E2 swings.',
                                    color: '#10b981',
                                },
                                {
                                    name: 'Testosterone Undecanoate',
                                    halfLife: '~21 days',
                                    freq: 'Every 10–14 weeks',
                                    origin: 'Long-acting depot',
                                    notes: 'Aveed / Nebido. Very convenient but less adjustable. Not ideal if fine-tuning is needed.',
                                    color: '#f59e0b',
                                },
                                {
                                    name: 'Testosterone Suspension',
                                    halfLife: '< 1 day',
                                    freq: 'Daily or ED',
                                    origin: 'Ester-free',
                                    notes: 'Purely free testosterone in water. Very painful. Rarely used for TRT; more common in performance contexts.',
                                    color: '#ef4444',
                                },
                            ].map(ester => (
                                <div key={ester.name} className={styles.esterCard} style={{ '--ester-color': ester.color }}>
                                    <div className={styles.esterHeader}>
                                        <h4>{ester.name}</h4>
                                        <span className={styles.esterOrigin}>{ester.origin}</span>
                                    </div>
                                    <div className={styles.esterStats}>
                                        <div>
                                            <span className={styles.esterStatLabel}><Clock size={12} /> Half-life</span>
                                            <span className={styles.esterStatValue}>{ester.halfLife}</span>
                                        </div>
                                        <div>
                                            <span className={styles.esterStatLabel}><Activity size={12} /> Frequency</span>
                                            <span className={styles.esterStatValue}>{ester.freq}</span>
                                        </div>
                                    </div>
                                    <p className={styles.esterNotes}>{ester.notes}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Protocols */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <BarChart3 size={24} />
                            <h2>Common TRT Protocols</h2>
                        </div>

                        <div className={styles.contentBlock}>
                            <p>
                                There is no universally "optimal" TRT protocol — the best approach is the one that
                                keeps your labs within range and eliminates symptoms. The following are evidence-based
                                starting points. <strong>Always titrate based on blood work, not symptoms alone.</strong>
                            </p>
                        </div>

                        <Accordion title="🟢 Standard Once-Weekly Protocol (Beginner)" defaultOpen>
                            <div className={styles.protocolBlock}>
                                <div className={styles.protocolMeta}>
                                    <span className={`${styles.levelBadge} ${styles.levelBeginner}`}>Conservative</span>
                                    <span>Best for: New to TRT, low SHBG uncertainty, convenience</span>
                                </div>
                                <div className={styles.protocolTable}>
                                    <div className={styles.protocolRow}>
                                        <strong>Weeks 1–4</strong>
                                        <span>100 mg Testosterone Cypionate / Enanthate</span>
                                        <span>Once weekly (IM or SubQ)</span>
                                        <span>Establish baseline, no dose change</span>
                                    </div>
                                    <div className={styles.protocolRow}>
                                        <strong>Week 6</strong>
                                        <span>Blood work</span>
                                        <span>Trough level (day before next injection)</span>
                                        <span>Adjust dose if needed</span>
                                    </div>
                                    <div className={styles.protocolRow}>
                                        <strong>Weeks 4–12</strong>
                                        <span>100–200 mg (adjusted)</span>
                                        <span>Once weekly</span>
                                        <span>Target: 600–900 ng/dL trough</span>
                                    </div>
                                </div>
                                <div className={styles.tipBox}>
                                    <strong>Tip:</strong> Take labs at consistent trough timing (morning, day before next
                                    injection) for reliable, comparable results.
                                </div>
                            </div>
                        </Accordion>

                        <Accordion title="🔵 Twice-Weekly Split Protocol (Recommended)">
                            <div className={styles.protocolBlock}>
                                <div className={styles.protocolMeta}>
                                    <span className={`${styles.levelBadge} ${styles.levelIntermediate}`}>Intermediate</span>
                                    <span>Best for: E2 sensitivity, stable libido, fewer side effects</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.7 }}>
                                    Splitting the weekly dose into two equal injections (e.g. Monday/Thursday or
                                    Sunday/Wednesday) dramatically smooths serum peaks and troughs, reducing
                                    oestrogen spikes and improving overall side-effect profile.
                                </p>
                                <div className={styles.protocolTable}>
                                    <div className={styles.protocolRow}>
                                        <strong>Mon + Thu</strong>
                                        <span>60–75 mg each pin</span>
                                        <span>120–150 mg/week total</span>
                                        <span>Target mid-range T, stable E2</span>
                                    </div>
                                </div>
                            </div>
                        </Accordion>

                        <Accordion title="⚪ EOD / Daily Protocol (Advanced Stability)">
                            <div className={styles.protocolBlock}>
                                <div className={styles.protocolMeta}>
                                    <span className={`${styles.levelBadge} ${styles.levelAdvanced}`}>Advanced</span>
                                    <span>Best for: High SHBG, maximum level stability, propionate users</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                    Daily or every-other-day (EOD) subcutaneous micro-injections with short esters
                                    (propionate or even cypionate/enanthate in very small volumes) produce near-
                                    physiological testosterone curves with minimal peak-to-trough variation. Requires
                                    commitment but offers unmatched stability.
                                </p>
                            </div>
                        </Accordion>

                        <Accordion title="💊 Non-Injectable Options">
                            <div className={styles.protocolBlock}>
                                <div className={styles.nonInjectableGrid}>
                                    {[
                                        { type: 'Topical Gels / Creams', example: 'AndroGel, Testogel, compounded cream', notes: 'Daily application. Convenient but absorption varies enormously. Risk of transference to partners/children.' },
                                        { type: 'Transdermal Patches', example: 'Androderm', notes: 'Daily patch. Consistent delivery. Skin irritation common. Rarely used today.' },
                                        { type: 'Buccal Tablets', example: 'Striant', notes: 'Placed against gum, twice daily. Releases T through mucosa. Unusual but effective.' },
                                        { type: 'Subcutaneous Pellets', example: 'Testopel', notes: 'Inserted under skin every 3–6 months. Stable levels but inability to adjust dose mid-cycle.' },
                                        { type: 'Oral Testosterone Undecanoate', example: 'Jatenzo, Kyzatrex', notes: 'Newer FDA-approved oral. Taken with a fat-containing meal. Does not cause liver toxicity like older oral methyltestosterone.' },
                                        { type: 'Nasal Gel', example: 'Natesto', notes: 'Applied 3× per day. Preserves LH/FSH pulses. Good option for fertility preservation.' },
                                    ].map(({ type, example, notes }) => (
                                        <div key={type} className={styles.nonInjectableCard}>
                                            <h4>{type}</h4>
                                            <span className={styles.examplePill}>{example}</span>
                                            <p>{notes}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Accordion>
                    </section>

                    {/* Ancillaries */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Syringe size={24} />
                            <h2>Ancillary Medications</h2>
                        </div>

                        <div className={styles.contentBlock}>
                            <p>
                                TRT often requires supporting medications to manage side effects, preserve fertility,
                                or optimize the therapy. These are not always necessary — let blood work guide you.
                            </p>
                        </div>

                        <div className={styles.ancillaryGrid}>
                            {[
                                {
                                    category: 'Aromatase Inhibitors (AIs)',
                                    color: '#ef4444',
                                    icon: '⚗️',
                                    items: [
                                        { name: 'Anastrozole (Arimidex)', dose: '0.25–0.5 mg E3D or twice/week', notes: 'Reduces T→E2 conversion. Most prescribed AI on TRT. Use the minimum effective dose.' },
                                        { name: 'Exemestane (Aromasin)', dose: '12.5 mg E3D', notes: 'Steroidal AI; less rebounding than anastrozole. Some prefer for mood stability.' },
                                        { name: 'Letrozole', dose: '0.25–0.5 mg/week (very low)', notes: 'Very potent. Rarely needed on TRT. Reserved for stubborn high E2 cases.' },
                                    ],
                                    warning: 'Avoid crushing E2 below 20 pg/mL. Low oestrogen causes joint pain, mood issues, and cardiovascular risk. Many men do not need an AI on moderate TRT doses.',
                                },
                                {
                                    category: 'SERMs (Fertility & LH Preservation)',
                                    color: '#10b981',
                                    icon: '🧬',
                                    items: [
                                        { name: 'Clomiphene (Clomid)', dose: '12.5–25 mg daily or EOD', notes: 'Blocks E2 receptors in hypothalamus → raises LH/FSH → stimulates natural T production. Used on TRT or as alternative.' },
                                        { name: 'Enclomiphene', dose: '12.5–25 mg daily', notes: 'Purified active isomer of clomid (zuclomiphene removed). Fewer visual/mood side effects. Excellent for secondary hypogonadism.' },
                                        { name: 'Tamoxifen (Nolvadex)', dose: '10–20 mg daily', notes: 'Blocks E2 at breast tissue. Used for gynecomastia prevention/treatment, not estrogen control in blood.' },
                                    ],
                                    warning: null,
                                },
                                {
                                    category: 'hCG (Fertility & Testicular Health)',
                                    color: '#f59e0b',
                                    icon: '🔬',
                                    items: [
                                        { name: 'hCG (Human Chorionic Gonadotropin)', dose: '250–500 IU EOD or 2×/week', notes: 'Mimics LH signal to testes. Maintains intratesticular testosterone, prevents testicular atrophy, preserves fertility on TRT.' },
                                        { name: 'Gonadorelin (GnRH)', dose: '100 mcg SubQ 2×/week', notes: 'Newer alternative to hCG. Pulses the hypothalamic-pituitary axis naturally. Preserves fertility. Compounded form available.' },
                                    ],
                                    warning: 'hCG can raise E2 significantly — monitor oestradiol closely when adding it to TRT.',
                                },
                                {
                                    category: 'DHT Management',
                                    color: '#8b5cf6',
                                    icon: '💊',
                                    items: [
                                        { name: 'Finasteride', dose: '0.5–1 mg daily', notes: 'Blocks 5-alpha reductase → reduces DHT conversion. Used for hair loss and prostate. Can cause sexual side effects (post-finasteride syndrome in rare cases).' },
                                        { name: 'Dutasteride', dose: '0.05–0.5 mg daily', notes: 'Blocks both type 1 and type 2 5-AR. More potent than finasteride. Also used for BPH/hair loss.' },
                                    ],
                                    warning: 'DHT is responsible for many positive TRT effects including libido and mood. Suppressing it too aggressively can reverse TRT benefits.',
                                },
                            ].map(({ category, color, icon, items, warning }) => (
                                <div key={category} className={styles.ancillaryCategory} style={{ '--anc-color': color }}>
                                    <div className={styles.ancillaryCategoryHeader}>
                                        <span className={styles.ancillaryIcon}>{icon}</span>
                                        <h3>{category}</h3>
                                    </div>
                                    <div className={styles.ancillaryItems}>
                                        {items.map(({ name, dose, notes }) => (
                                            <div key={name} className={styles.ancillaryItem}>
                                                <div className={styles.ancillaryItemHeader}>
                                                    <strong>{name}</strong>
                                                    <span className={styles.ancillaryDose}>{dose}</span>
                                                </div>
                                                <p>{notes}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {warning && (
                                        <div className={styles.ancillaryWarning}>
                                            <AlertTriangle size={16} />
                                            <span>{warning}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Benefits */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <TrendingUp size={24} />
                            <h2>Benefits of Optimized TRT</h2>
                        </div>

                        <div className={styles.benefitsGrid}>
                            {[
                                { icon: '💪', title: 'Increased Muscle Mass & Strength', desc: 'Testosterone is the primary anabolic hormone. Optimized levels support nitrogen retention, protein synthesis, and satellite cell activation for muscle growth and repair.' },
                                { icon: '🔥', title: 'Reduced Body Fat', desc: 'Testosterone stimulates fat oxidation and reduces lipoprotein lipase activity in fat tissue. Many men see significant waist reduction without diet changes.' },
                                { icon: '🧠', title: 'Improved Cognition & Mood', desc: 'Testosterone receptors are abundant in the brain. Optimal levels correlate with better memory, spatial reasoning, reduced depression, and improved motivation.' },
                                { icon: '❤️', title: 'Cardiovascular Health', desc: 'Contrary to outdated fears, properly dosed TRT improves lipid profiles, red blood cell parameters, and has been associated with reduced cardiovascular events in hypogonadal men.' },
                                { icon: '🦴', title: 'Bone Density', desc: 'Testosterone (via aromatization to estradiol) is critical for bone mineral density. TRT reduces fracture risk in hypogonadal men and slows age-related bone loss.' },
                                { icon: '⚡', title: 'Energy & Vitality', desc: 'Fatigue is one of the most common and most rapidly resolved symptoms. Most men notice significant energy improvements within 3–6 weeks of initiating TRT.' },
                                { icon: '🛌', title: 'Better Sleep Quality', desc: 'Low T disrupts sleep architecture. TRT often improves deep sleep duration and reduces sleep disturbances, especially when combined with E2 control.' },
                                { icon: '💑', title: 'Sexual Function & Libido', desc: 'Perhaps the most cited benefit. Testosterone drives sexual desire in both men and women. TRT consistently improves libido, erectile quality, and sexual satisfaction when optimized.' },
                            ].map(({ icon, title, desc }) => (
                                <div key={title} className={styles.benefitCard}>
                                    <span className={styles.benefitIcon}>{icon}</span>
                                    <h4>{title}</h4>
                                    <p>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Side Effects & Risks */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <AlertTriangle size={24} />
                            <h2>Side Effects & Risk Management</h2>
                        </div>

                        <div className={styles.contentBlock}>
                            <p>
                                Most TRT side effects are <strong>dose-dependent and manageable</strong> with proper
                                monitoring. The goal is optimization, not maximization. Work with your blood work.
                            </p>
                        </div>

                        <div className={styles.sideEffectsGrid}>
                            {[
                                {
                                    effect: 'Erythrocytosis (High Hematocrit)',
                                    severity: 'Monitor closely',
                                    color: '#ef4444',
                                    management: 'TRT stimulates EPO and red blood cell production. Hematocrit above 52% increases clotting risk. Managed with therapeutic phlebotomy (blood donation), dose reduction, or switching to shorter esters / more frequent dosing.',
                                },
                                {
                                    effect: 'Oestradiol Elevation / Gynecomastia',
                                    severity: 'Common, manageable',
                                    color: '#f59e0b',
                                    management: 'Excess testosterone aromatizes to oestradiol. Symptoms include breast tenderness, nipple sensitivity, water retention. Managed with AIs (anastrozole/exemestane) or SERMs (tamoxifen for gyno prevention). Avoid crashing E2.',
                                },
                                {
                                    effect: 'Testicular Atrophy',
                                    severity: 'Very common',
                                    color: '#6b7280',
                                    management: 'Exogenous testosterone suppresses LH/FSH, causing testes to reduce in size and function. Prevented/reversed with hCG (250–500 IU EOD) or gonadorelin. Does not impact TRT effectiveness.',
                                },
                                {
                                    effect: 'Fertility Suppression',
                                    severity: 'Important',
                                    color: '#8b5cf6',
                                    management: 'TRT suppresses spermatogenesis in most men. If fathering children is a concern, use hCG + FSH, consider clomiphene monotherapy, or sperm banking before starting TRT.',
                                },
                                {
                                    effect: 'Acne & Oily Skin',
                                    severity: 'Common',
                                    color: '#f97316',
                                    management: 'Driven by DHT stimulating sebaceous glands. Often resolves after stabilization. Managed with topical retinoids, benzoyl peroxide, or low-dose finasteride if severe.',
                                },
                                {
                                    effect: 'Hair Loss / Androgenic Alopecia',
                                    severity: 'Genetic risk',
                                    color: '#6366f1',
                                    management: 'TRT can accelerate male pattern baldness in genetically predisposed men (DHT-driven). Managed with finasteride, dutasteride, minoxidil, or microneedling.',
                                },
                                {
                                    effect: 'Sleep Apnea',
                                    severity: 'Contraindication risk',
                                    color: '#14b8a6',
                                    management: 'TRT can worsen or unmask obstructive sleep apnea. Screen before starting. If present, treat with CPAP first. TRT is relatively contraindicated in severe untreated OSA.',
                                },
                                {
                                    effect: 'Prostate Health',
                                    severity: 'Monitor, don\'t fear',
                                    color: '#22c55e',
                                    management: 'TRT does not cause prostate cancer per current evidence (saturation model). However, it is contraindicated in active prostate cancer. Monitor PSA annually. TRT may unmask pre-existing BPH symptoms.',
                                },
                            ].map(({ effect, severity, color, management }) => (
                                <div key={effect} className={styles.sideEffectCard} style={{ '--se-color': color }}>
                                    <div className={styles.sideEffectHeader}>
                                        <h4>{effect}</h4>
                                        <span className={styles.severityLabel}>{severity}</span>
                                    </div>
                                    <p>{management}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Injection Technique */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Syringe size={24} />
                            <h2>Injection Administration</h2>
                        </div>

                        <div className={styles.twoColumn}>
                            <div>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Intramuscular (IM)</h3>
                                <div className={styles.injectionStep}><span className={styles.stepNum}>1</span><div><strong>Sites:</strong> Glute (ventroglute preferred), vastus lateralis (quad), deltoid. Ventroglute has the largest muscle belly and fewest nerves.</div></div>
                                <div className={styles.injectionStep}><span className={styles.stepNum}>2</span><div><strong>Needle:</strong> 23–25G, 1–1.5" for glute/quad; 25G, 1" for deltoid. Shorter needles fine for lean individuals.</div></div>
                                <div className={styles.injectionStep}><span className={styles.stepNum}>3</span><div><strong>Volume:</strong> Up to 3 mL per injection site. Most TRT doses fit in 0.5–1 mL at typical concentrations (200 mg/mL).</div></div>
                                <div className={styles.injectionStep}><span className={styles.stepNum}>4</span><div><strong>Technique:</strong> Wipe vial & skin with alcohol swab, let dry, inject at 90°, pull back to check for blood, inject slowly, remove, apply slight pressure.</div></div>
                            </div>
                            <div>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Subcutaneous (SubQ)</h3>
                                <div className={styles.injectionStep}><span className={styles.stepNum}>1</span><div><strong>Sites:</strong> Abdomen (1–2 inches from navel), love handles, thigh, upper buttock. Pinch 1–2 inches of fat.</div></div>
                                <div className={styles.injectionStep}><span className={styles.stepNum}>2</span><div><strong>Needle:</strong> 27–29G, 0.5" insulin-type syringe. Very comfortable — many prefer this route.</div></div>
                                <div className={styles.injectionStep}><span className={styles.stepNum}>3</span><div><strong>Volume:</strong> Keep volumes to ≤0.5 mL per site to prevent painful lumps. Dilute with sterile saline if needed.</div></div>
                                <div className={styles.injectionStep}><span className={styles.stepNum}>4</span><div><strong>Absorption:</strong> Slightly slower than IM, which can blunt peaks and troughs further — beneficial for level stability and E2 management.</div></div>
                            </div>
                        </div>

                        <div className={styles.warningBox}>
                            <AlertTriangle size={20} />
                            <div>
                                <strong>Aspiration:</strong> Modern injection technique guidelines (CDC, WHO) no longer
                                recommend routinely aspirating before IM injection in typical TRT sites. However, some
                                practitioners still recommend it for peace of mind. Never inject into a vein — if you
                                aspirate blood, discard the syringe and start fresh.
                            </div>
                        </div>
                    </section>

                    {/* Optimisation Tips */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Brain size={24} />
                            <h2>Optimisation & Lifestyle Synergies</h2>
                        </div>

                        <div className={styles.optimGrid}>
                            {[
                                { icon: '🏋️', title: 'Resistance Training', desc: 'Amplifies TRT benefits dramatically. Compound lifts (squat, deadlift, bench) sensitize androgen receptors and optimize testosterone utilization.' },
                                { icon: '😴', title: 'Sleep Hygiene', desc: 'Testosterone is produced during deep sleep. Poor sleep undermines TRT. Aim for 7–9 hours. Address sleep apnea before starting.' },
                                { icon: '🥩', title: 'Dietary Fat Intake', desc: 'Cholesterol (from dietary fat) is the precursor to all steroid hormones. Very low-fat diets can blunt T production. Aim for 25–35% of calories from fat.' },
                                { icon: '🧘', title: 'Stress Management', desc: 'Cortisol competes with testosterone and can blunt its effects. Chronic stress management (meditation, HRV training) maximizes TRT benefits.' },
                                { icon: '🩸', title: 'Donate Blood', desc: 'Regular blood donation helps manage hematocrit. Most blood banks allow donations every 56 days. Schedule proactively if your HCT trends high.' },
                                { icon: '🚫', title: 'Avoid Alcohol Excess', desc: 'Heavy alcohol increases aromatization, liver stress, and disrupts sleep — all counterproductive to TRT optimization.' },
                                { icon: '💊', title: 'Support Supplements', desc: 'Consider vitamin D3+K2, magnesium glycinate, zinc (if deficient), and omega-3s to support hormonal health and cardiovascular wellbeing.' },
                                { icon: '📊', title: 'Consistent Lab Timing', desc: 'Always draw trough labs (morning, before your next scheduled injection) and document the exact timing. This is the only way to reliably track your levels over time.' },
                            ].map(({ icon, title, desc }) => (
                                <div key={title} className={styles.optimCard}>
                                    <span className={styles.optimIcon}>{icon}</span>
                                    <div>
                                        <h4>{title}</h4>
                                        <p>{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Contraindications */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Shield size={24} />
                            <h2>Contraindications & Special Populations</h2>
                        </div>

                        <div className={styles.contraindicationGrid}>
                            <div className={styles.contraindicationCard} style={{ '--ci-color': '#ef4444' }}>
                                <h4>🚫 Absolute Contraindications</h4>
                                <ul>
                                    <li>Active or suspected prostate cancer</li>
                                    <li>Active or suspected breast cancer in men</li>
                                    <li>Hematocrit &gt;54% (uncontrolled)</li>
                                    <li>Severe untreated sleep apnea</li>
                                    <li>Uncontrolled heart failure</li>
                                    <li>Recent MI or stroke (&lt;6 months)</li>
                                    <li>Desire for fertility (without hCG protocol)</li>
                                </ul>
                            </div>
                            <div className={styles.contraindicationCard} style={{ '--ci-color': '#f59e0b' }}>
                                <h4>⚠️ Relative Contraindications / Caution</h4>
                                <ul>
                                    <li>Elevated PSA or BPH symptoms</li>
                                    <li>Treated sleep apnea — monitor closely</li>
                                    <li>Polycythemia / thrombophilia history</li>
                                    <li>Gynecomastia history</li>
                                    <li>Liver disease (avoid oral C17-alpha-alkylated forms)</li>
                                    <li>Age under 25 (risk of premature epiphyseal closure)</li>
                                    <li>Significant cardiovascular disease — proceed with caution, close monitoring</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.warningBox} style={{ marginTop: '1.5rem' }}>
                            <AlertTriangle size={20} />
                            <div>
                                <strong>Disclaimer:</strong> This guide is for educational purposes only. TRT is a
                                prescription medication in most countries. Always work with a licensed physician who
                                specializes in hormone therapy. Self-administering without proper medical supervision
                                is not recommended and carries legal and health risks.
                            </div>
                        </div>
                    </section>

                    {/* Research Links */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <BookOpen size={24} />
                            <h2>Key Research & References</h2>
                        </div>
                        <div className={styles.researchLinks}>
                            {[
                                { title: 'Testosterone Therapy in Men with Hypogonadism — AUA Guideline', url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline' },
                                { title: 'EAU Guidelines on Sexual and Reproductive Health — Male Hypogonadism', url: 'https://uroweb.org/guidelines/sexual-and-reproductive-health' },
                                { title: 'Testosterone Trial (TTrials) — NEJM 2016', url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1506119' },
                                { title: 'Testosterone Replacement and Cardiovascular Events — TRAVERSE Trial 2023', url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2212327' },
                                { title: 'Obesity and Male Reproductive Function — Nature Reviews Endocrinology', url: 'https://www.nature.com/articles/s41574-023-00812-z' },
                            ].map(({ title, url }) => (
                                <a key={title} href={url} target="_blank" rel="noopener noreferrer" className={styles.researchLink}>
                                    <ExternalLink size={16} />
                                    <span>{title}</span>
                                </a>
                            ))}
                        </div>
                    </section>

                    {/* Next Steps */}
                    <section className={styles.nextSteps}>
                        <h2>Continue Learning</h2>
                        <div className={styles.nextStepsGrid}>
                            <Link to="/encyclopedia" className={styles.nextStepCard}>
                                <BookOpen size={24} />
                                <div>
                                    <h4>Peptide Encyclopedia</h4>
                                    <p>Explore peptides that synergize with TRT — BPC-157, Ipamorelin, PT-141 & more</p>
                                </div>
                            </Link>
                            <Link to="/guides/injection" className={styles.nextStepCard}>
                                <Syringe size={24} />
                                <div>
                                    <h4>Injection Technique Guide</h4>
                                    <p>Detailed step-by-step injection guide for SubQ and IM routes</p>
                                </div>
                            </Link>
                            <Link to="/blood-work" className={styles.nextStepCard}>
                                <Activity size={24} />
                                <div>
                                    <h4>Blood Work Tracker</h4>
                                    <p>Track and visualize your lab results over time to optimize your protocol</p>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default TRTGuide;
