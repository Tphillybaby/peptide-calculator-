import React from 'react';
import { ArrowLeft, Beaker, Dna, Zap, Shield, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import styles from './BeginnerGuide.module.css';

const BeginnerGuide = () => {
    return (
        <>
            <SEO
                title="What Are Peptides? Beginner's Complete Guide"
                description="Learn what peptides are, how they work in your body, their benefits, and how to start safely. A complete beginner's guide to peptide therapy."
                canonical="/guides/beginner"
            />
            <div className="page-container">
                <div className={styles.container}>
                    <Link to="/guides" className={styles.backLink}>
                        <ArrowLeft size={20} /> Back to Guides
                    </Link>

                    <div className={styles.hero}>
                        <div className={styles.heroIcon}>
                            <Dna size={32} />
                        </div>
                        <h1>What Are Peptides?</h1>
                        <p className={styles.heroSubtitle}>
                            A complete beginner's guide to understanding peptides, how they work, and getting started safely.
                        </p>
                    </div>

                    {/* What Are Peptides Section */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Beaker size={24} />
                            <h2>Understanding Peptides</h2>
                        </div>

                        <div className={styles.contentBlock}>
                            <h3>The Basics</h3>
                            <p>
                                <strong>Peptides are short chains of amino acids</strong> — the same building blocks that make up proteins.
                                Think of amino acids as letters, peptides as words, and proteins as full sentences. While proteins
                                can contain hundreds or thousands of amino acids, peptides are much smaller, typically containing
                                between <strong>2 to 50 amino acids</strong>.
                            </p>
                        </div>

                        <div className={styles.contentBlock}>
                            <h3>Why Size Matters</h3>
                            <p>
                                Because peptides are smaller than proteins, they can be more easily absorbed by your body.
                                This makes them particularly effective at <strong>signaling specific biological processes</strong>.
                                Your body naturally produces many peptides that act as hormones and signaling molecules.
                            </p>
                        </div>

                        <div className={styles.infoBox}>
                            <div className={styles.infoBoxIcon}>
                                <Dna size={20} />
                            </div>
                            <div>
                                <strong>Natural vs. Synthetic:</strong> Your body makes peptides naturally (like insulin and
                                growth hormone releasing peptides). Synthetic peptides are lab-made versions designed to mimic
                                or enhance these natural processes.
                            </div>
                        </div>
                    </section>

                    {/* How They Work Section */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Zap size={24} />
                            <h2>How Peptides Work</h2>
                        </div>

                        <div className={styles.contentBlock}>
                            <p>
                                Peptides work by <strong>binding to specific receptors</strong> on your cells, like a key
                                fitting into a lock. When this happens, they trigger a cascade of biological responses:
                            </p>
                        </div>

                        <div className={styles.processSteps}>
                            <div className={styles.processStep}>
                                <div className={styles.stepNumber}>1</div>
                                <div>
                                    <strong>Binding</strong>
                                    <p>The peptide attaches to a receptor on a cell's surface</p>
                                </div>
                            </div>
                            <div className={styles.processStep}>
                                <div className={styles.stepNumber}>2</div>
                                <div>
                                    <strong>Signaling</strong>
                                    <p>This triggers a chain reaction inside the cell</p>
                                </div>
                            </div>
                            <div className={styles.processStep}>
                                <div className={styles.stepNumber}>3</div>
                                <div>
                                    <strong>Response</strong>
                                    <p>Your body responds — healing, hormone release, or other effects</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.exampleBox}>
                            <h4>Example: Growth Hormone Secretagogues</h4>
                            <p>
                                Peptides like <strong>Ipamorelin</strong> or <strong>CJC-1295</strong> bind to receptors
                                in your pituitary gland, signaling it to release more growth hormone naturally — rather
                                than injecting synthetic growth hormone directly.
                            </p>
                        </div>
                    </section>

                    {/* Categories Section */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <BookOpen size={24} />
                            <h2>Common Peptide Categories</h2>
                        </div>

                        <div className={styles.categoryGrid}>
                            <div className={styles.categoryCard}>
                                <h4>GLP-1 Agonists</h4>
                                <p>Weight loss and blood sugar control</p>
                                <span className={styles.examples}>Semaglutide, Tirzepatide</span>
                            </div>
                            <div className={styles.categoryCard}>
                                <h4>Growth Hormone Secretagogues</h4>
                                <p>Stimulate natural GH production</p>
                                <span className={styles.examples}>Ipamorelin, CJC-1295, MK-677</span>
                            </div>
                            <div className={styles.categoryCard}>
                                <h4>Healing Peptides</h4>
                                <p>Tissue repair and recovery</p>
                                <span className={styles.examples}>BPC-157, TB-500</span>
                            </div>
                            <div className={styles.categoryCard}>
                                <h4>Cognitive Peptides</h4>
                                <p>Brain function and focus</p>
                                <span className={styles.examples}>Selank, Semax</span>
                            </div>
                            <div className={styles.categoryCard}>
                                <h4>Skin & Anti-Aging</h4>
                                <p>Collagen and rejuvenation</p>
                                <span className={styles.examples}>GHK-Cu, Epithalon</span>
                            </div>
                            <div className={styles.categoryCard}>
                                <h4>Sexual Health</h4>
                                <p>Libido and function</p>
                                <span className={styles.examples}>PT-141, Melanotan II</span>
                            </div>
                        </div>

                        <div className={styles.ctaBox}>
                            <p>Explore all peptides organized by health benefit:</p>
                            <Link to="/encyclopedia" className="btn-primary">
                                Browse Encyclopedia
                            </Link>
                        </div>
                    </section>

                    {/* Benefits & Risks Section */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Shield size={24} />
                            <h2>Benefits & Important Considerations</h2>
                        </div>

                        <div className={styles.twoColumn}>
                            <div className={styles.benefitsColumn}>
                                <h4><CheckCircle size={18} /> Potential Benefits</h4>
                                <ul>
                                    <li>Targeted action with fewer side effects than many drugs</li>
                                    <li>Support natural body processes rather than replacing them</li>
                                    <li>Wide range of applications (healing, performance, anti-aging)</li>
                                    <li>Often work synergistically with lifestyle changes</li>
                                    <li>Many have established safety profiles from research</li>
                                </ul>
                            </div>
                            <div className={styles.risksColumn}>
                                <h4><AlertTriangle size={18} /> Important Considerations</h4>
                                <ul>
                                    <li>Quality varies significantly between suppliers</li>
                                    <li>Many peptides lack FDA approval for general use</li>
                                    <li>Improper dosing can cause side effects</li>
                                    <li>Some require injection (subcutaneous or intramuscular)</li>
                                    <li>Should not replace medical advice for serious conditions</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.warningBox}>
                            <AlertTriangle size={20} />
                            <div>
                                <strong>Research Purposes:</strong> Many peptides are sold "for research purposes only"
                                and are not FDA-approved medications. Always consult with a healthcare professional
                                before starting any peptide protocol.
                            </div>
                        </div>
                    </section>

                    {/* Getting Started Section */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <CheckCircle size={24} />
                            <h2>Getting Started: Step by Step</h2>
                        </div>

                        <div className={styles.stepCard}>
                            <div className={styles.stepBadge}>Step 1</div>
                            <h3>Research & Sourcing</h3>
                            <p>
                                Not all peptides are created equal. The most critical step is sourcing high-purity
                                peptides (99%+) from a vendor that provides <strong>COAs (Certificates of Analysis)</strong> from
                                third-party labs. Look for reputable vendors with verified testing.
                            </p>
                            <div className={styles.tipBox}>
                                <strong>Tip:</strong> Check our Encyclopedia for specific peptide details before buying.
                            </div>
                        </div>

                        <div className={styles.stepCard}>
                            <div className={styles.stepBadge}>Step 2</div>
                            <h3>Gather Your Supplies</h3>
                            <ul className={styles.checklist}>
                                <li>
                                    <CheckCircle size={16} />
                                    <span><strong>Bacteriostatic Water:</strong> For reconstituting the powder</span>
                                </li>
                                <li>
                                    <CheckCircle size={16} />
                                    <span><strong>Insulin Syringes:</strong> 31G or 30G, 1ml or 0.5ml size</span>
                                </li>
                                <li>
                                    <CheckCircle size={16} />
                                    <span><strong>Alcohol Swabs:</strong> To sterilize vials and skin</span>
                                </li>
                                <li>
                                    <CheckCircle size={16} />
                                    <span><strong>Sharps Container:</strong> For safe disposal</span>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.stepCard}>
                            <div className={styles.stepBadge}>Step 3</div>
                            <h3>Reconstitution (Mixing)</h3>
                            <p>This is the process of mixing bacteriostatic water with the peptide powder:</p>
                            <ol className={styles.numberedList}>
                                <li>Pop the caps off the peptide vial and water vial</li>
                                <li>Wipe both rubber stoppers with alcohol</li>
                                <li>Draw the desired amount of water (usually 1ml or 2ml) into a syringe</li>
                                <li>Slowly inject the water into the peptide vial — aim for the glass wall, not directly on the powder</li>
                                <li><strong>Do not shake!</strong> Gently swirl the vial until fully dissolved</li>
                            </ol>
                            <Link to="/calculator" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                                Use Reconstitution Calculator
                            </Link>
                        </div>

                        <div className={styles.stepCard}>
                            <div className={styles.stepBadge}>Step 4</div>
                            <h3>Start Low, Go Slow</h3>
                            <p>
                                Always start with the <strong>lowest effective dose</strong> to assess your tolerance.
                                Most side effects occur when users rush the titration process. Patience is key —
                                your body needs time to adjust.
                            </p>
                            <p>
                                Many peptides have specific titration schedules that gradually increase the dose
                                over weeks. Follow the recommended protocol for your specific peptide.
                            </p>
                        </div>

                        <div className={styles.stepCard}>
                            <div className={styles.stepBadge}>Step 5</div>
                            <h3>Track Your Progress</h3>
                            <p>
                                Keep detailed logs of your doses, timing, and any effects you notice.
                                This helps you optimize your protocol and identify what works best for you.
                            </p>
                            <Link to="/log" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                                Start Logging Your Doses
                            </Link>
                        </div>
                    </section>

                    {/* Next Steps */}
                    <section className={styles.nextSteps}>
                        <h2>Continue Learning</h2>
                        <div className={styles.nextStepsGrid}>
                            <Link to="/safety" className={styles.nextStepCard}>
                                <Shield size={24} />
                                <div>
                                    <h4>Safety & Storage Guide</h4>
                                    <p>Learn proper storage, reconstitution tips, and safety protocols</p>
                                </div>
                            </Link>
                            <Link to="/guides/injection" className={styles.nextStepCard}>
                                <Zap size={24} />
                                <div>
                                    <h4>Injection Techniques</h4>
                                    <p>Step-by-step guide for subcutaneous and intramuscular injections</p>
                                </div>
                            </Link>
                            <Link to="/encyclopedia" className={styles.nextStepCard}>
                                <BookOpen size={24} />
                                <div>
                                    <h4>Peptide Encyclopedia</h4>
                                    <p>Explore all peptides with detailed protocols and benefits</p>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default BeginnerGuide;
