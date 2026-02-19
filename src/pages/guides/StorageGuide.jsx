import React from 'react';
import { ArrowLeft, Thermometer, Droplets, Clock, Shield, AlertTriangle, CheckCircle, Snowflake, Sun, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import styles from './StorageGuide.module.css';

const StorageGuide = () => {
    return (
        <>
            <SEO
                title="Peptide Storage Guide | Temperature, Shelf Life & Best Practices"
                description="Learn how to properly store peptides for maximum potency. Covers temperature requirements, reconstitution storage, shelf life, and common mistakes to avoid."
                canonical="/guides/storage"
            />
            <div className="page-container">
                <div className={styles.container}>
                    <Link to="/guides" className={styles.backLink}>
                        <ArrowLeft size={20} /> Back to Guides
                    </Link>

                    <div className={styles.hero}>
                        <div className={styles.heroIcon}>
                            <Thermometer size={32} />
                        </div>
                        <h1>Peptide Storage Guide</h1>
                        <p className={styles.heroSubtitle}>
                            Everything you need to know about properly storing peptides to maintain their potency and safety.
                        </p>
                    </div>

                    {/* Why Storage Matters */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Shield size={24} />
                            <h2>Why Proper Storage Matters</h2>
                        </div>

                        <div className={styles.contentBlock}>
                            <p>
                                Peptides are <strong>biological molecules</strong> that are sensitive to temperature, light, and moisture.
                                Improper storage can cause them to <strong>degrade, lose potency, or become contaminated</strong> —
                                rendering them ineffective or potentially harmful. Following proper storage protocols ensures you
                                get the full benefit from your peptides.
                            </p>
                        </div>

                        <div className={styles.infoBox}>
                            <div className={styles.infoBoxIcon}>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <strong>Key Principle:</strong> Heat is the #1 enemy of peptides. Even short exposure to
                                room temperature during shipping or handling can begin degradation. Always minimize time
                                outside of cold storage.
                            </div>
                        </div>
                    </section>

                    {/* Storage States */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Snowflake size={24} />
                            <h2>Storage by State</h2>
                        </div>

                        <div className={styles.storageGrid}>
                            <div className={styles.storageCard}>
                                <div className={styles.storageCardHeader}>
                                    <Package size={20} />
                                    <h3>Lyophilized (Powder)</h3>
                                </div>
                                <div className={styles.tempBadge} data-level="cold">
                                    <Snowflake size={14} />
                                    -20°C / -4°F (Freezer)
                                </div>
                                <ul className={styles.storageList}>
                                    <li>
                                        <CheckCircle size={14} />
                                        <span>Store in freezer for <strong>maximum shelf life</strong> (1-3+ years)</span>
                                    </li>
                                    <li>
                                        <CheckCircle size={14} />
                                        <span>Refrigerator (2-8°C) is acceptable for <strong>6-12 months</strong></span>
                                    </li>
                                    <li>
                                        <CheckCircle size={14} />
                                        <span>Keep in original sealed vial until ready to reconstitute</span>
                                    </li>
                                    <li>
                                        <CheckCircle size={14} />
                                        <span>Protect from light — store in a dark container or wrap in foil</span>
                                    </li>
                                </ul>
                            </div>

                            <div className={styles.storageCard}>
                                <div className={styles.storageCardHeader}>
                                    <Droplets size={20} />
                                    <h3>Reconstituted (Mixed)</h3>
                                </div>
                                <div className={styles.tempBadge} data-level="cool">
                                    <Thermometer size={14} />
                                    2-8°C / 36-46°F (Refrigerator)
                                </div>
                                <ul className={styles.storageList}>
                                    <li>
                                        <CheckCircle size={14} />
                                        <span><strong>Must</strong> be refrigerated — never freeze reconstituted peptides</span>
                                    </li>
                                    <li>
                                        <CheckCircle size={14} />
                                        <span>Typical shelf life: <strong>30-60 days</strong> in the fridge</span>
                                    </li>
                                    <li>
                                        <CheckCircle size={14} />
                                        <span>Use bacteriostatic water (not sterile water) for longer stability</span>
                                    </li>
                                    <li>
                                        <CheckCircle size={14} />
                                        <span>Always use alcohol swabs before drawing from the vial</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Temperature Guide */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Thermometer size={24} />
                            <h2>Temperature Quick Reference</h2>
                        </div>

                        <div className={styles.tempTable}>
                            <div className={styles.tempRow}>
                                <div className={styles.tempLabel}>
                                    <Snowflake size={16} className={styles.freezerIcon} />
                                    Freezer (-20°C)
                                </div>
                                <div className={styles.tempDesc}>
                                    <strong>Best for:</strong> Long-term storage of lyophilized (powder) peptides
                                </div>
                                <div className={`${styles.tempDuration} ${styles.durationLong}`}>1-3+ years</div>
                            </div>
                            <div className={styles.tempRow}>
                                <div className={styles.tempLabel}>
                                    <Thermometer size={16} className={styles.fridgeIcon} />
                                    Refrigerator (2-8°C)
                                </div>
                                <div className={styles.tempDesc}>
                                    <strong>Best for:</strong> Reconstituted peptides &amp; shorter-term powder storage
                                </div>
                                <div className={`${styles.tempDuration} ${styles.durationMedium}`}>30-60 days (mixed)</div>
                            </div>
                            <div className={styles.tempRow}>
                                <div className={styles.tempLabel}>
                                    <Sun size={16} className={styles.roomIcon} />
                                    Room Temp (20-25°C)
                                </div>
                                <div className={styles.tempDesc}>
                                    <strong>Avoid:</strong> Only acceptable during active preparation/injection
                                </div>
                                <div className={`${styles.tempDuration} ${styles.durationShort}`}>Minutes only</div>
                            </div>
                        </div>
                    </section>

                    {/* Reconstitution Storage Tips */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Droplets size={24} />
                            <h2>After Reconstitution: Best Practices</h2>
                        </div>

                        <div className={styles.practicesList}>
                            <div className={styles.practiceItem}>
                                <div className={styles.practiceNumber}>1</div>
                                <div>
                                    <strong>Use Bacteriostatic Water</strong>
                                    <p>
                                        Bac water contains 0.9% benzyl alcohol, which inhibits bacterial growth and extends
                                        stability to 30-60+ days. Sterile water lacks this preservative and should be used
                                        within 24-48 hours.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.practiceItem}>
                                <div className={styles.practiceNumber}>2</div>
                                <div>
                                    <strong>Label Everything</strong>
                                    <p>
                                        Mark each vial with: peptide name, reconstitution date, concentration (e.g., 5mg/2ml),
                                        and expiration date. Use a permanent marker or label tape.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.practiceItem}>
                                <div className={styles.practiceNumber}>3</div>
                                <div>
                                    <strong>Keep It Dark</strong>
                                    <p>
                                        Many peptides are light-sensitive. Store vials in a dark area of your fridge, or wrap
                                        them in aluminum foil to block UV and visible light.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.practiceItem}>
                                <div className={styles.practiceNumber}>4</div>
                                <div>
                                    <strong>Minimize Punctures</strong>
                                    <p>
                                        Each needle puncture through the rubber stopper introduces a tiny amount of contamination
                                        risk. Pre-load syringes for multi-day use if appropriate, and always swab the stopper
                                        with alcohol before drawing.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.practiceItem}>
                                <div className={styles.practiceNumber}>5</div>
                                <div>
                                    <strong>Don't Shake — Swirl</strong>
                                    <p>
                                        Shaking can cause peptide degradation through shear forces and foaming. Gently
                                        roll or swirl the vial to mix.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Shelf Life by Peptide */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Clock size={24} />
                            <h2>Shelf Life by Peptide Type</h2>
                        </div>

                        <div className={styles.contentBlock}>
                            <p>
                                While individual peptides vary, here are general guidelines for reconstituted stability
                                when stored properly in the refrigerator with bacteriostatic water:
                            </p>
                        </div>

                        <div className={styles.shelfLifeGrid}>
                            <div className={styles.shelfLifeCard}>
                                <h4>GLP-1 Agonists</h4>
                                <span className={styles.shelfLifeExamples}>Semaglutide, Tirzepatide</span>
                                <div className={styles.shelfLifeTime}>30-56 days</div>
                                <p>Follow manufacturer guidance for FDA-approved versions.</p>
                            </div>
                            <div className={styles.shelfLifeCard}>
                                <h4>Growth Hormone Secretagogues</h4>
                                <span className={styles.shelfLifeExamples}>Ipamorelin, CJC-1295, GHRP-6</span>
                                <div className={styles.shelfLifeTime}>30-60 days</div>
                                <p>CJC-1295 with DAC tends to be more stable than without.</p>
                            </div>
                            <div className={styles.shelfLifeCard}>
                                <h4>Healing Peptides</h4>
                                <span className={styles.shelfLifeExamples}>BPC-157, TB-500</span>
                                <div className={styles.shelfLifeTime}>30-45 days</div>
                                <p>BPC-157 is relatively stable; TB-500 may degrade faster.</p>
                            </div>
                            <div className={styles.shelfLifeCard}>
                                <h4>Cognitive / Regulatory</h4>
                                <span className={styles.shelfLifeExamples}>Selank, Semax, Epithalon</span>
                                <div className={styles.shelfLifeTime}>14-30 days</div>
                                <p>Nasal peptides may have shorter stability windows.</p>
                            </div>
                        </div>

                        <div className={styles.warningBox}>
                            <AlertTriangle size={20} />
                            <div>
                                <strong>Important:</strong> These are general estimates. Always check vendor-specific
                                guidance and discard any solution that appears cloudy, discolored, or has visible particles.
                            </div>
                        </div>
                    </section>

                    {/* Common Mistakes */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <AlertTriangle size={24} />
                            <h2>Common Storage Mistakes</h2>
                        </div>

                        <div className={styles.twoColumn}>
                            <div className={styles.mistakesColumn}>
                                <h4><AlertTriangle size={18} /> Don't Do This</h4>
                                <ul>
                                    <li>Leave reconstituted vials at room temperature</li>
                                    <li>Freeze reconstituted (mixed) peptides</li>
                                    <li>Use sterile water for multi-week storage</li>
                                    <li>Store peptides in direct sunlight or heat</li>
                                    <li>Skip alcohol swabbing before drawing doses</li>
                                    <li>Mix with water by shaking vigorously</li>
                                </ul>
                            </div>
                            <div className={styles.correctColumn}>
                                <h4><CheckCircle size={18} /> Do This Instead</h4>
                                <ul>
                                    <li>Return vials to the fridge immediately after use</li>
                                    <li>Store mixed peptides at 2-8°C in the refrigerator</li>
                                    <li>Use bacteriostatic water for extended stability</li>
                                    <li>Keep vials in dark, cool, dry locations</li>
                                    <li>Always clean stopper with alcohol before each draw</li>
                                    <li>Gently roll or swirl the vial to dissolve</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Travel Tips */}
                    <section className={`card glass-panel ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Package size={24} />
                            <h2>Traveling with Peptides</h2>
                        </div>

                        <div className={styles.contentBlock}>
                            <p>
                                If you need to travel with reconstituted peptides, proper cold chain management is essential:
                            </p>
                        </div>

                        <div className={styles.practicesList}>
                            <div className={styles.practiceItem}>
                                <div className={styles.practiceNumber}>
                                    <Package size={16} />
                                </div>
                                <div>
                                    <strong>Use an Insulated Travel Case</strong>
                                    <p>
                                        A small insulin travel cooler or insulated pouch with ice packs works well. Ensure
                                        the vials don't directly contact the ice packs (wrap in a cloth).
                                    </p>
                                </div>
                            </div>
                            <div className={styles.practiceItem}>
                                <div className={styles.practiceNumber}>
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <strong>Time Your Travel</strong>
                                    <p>
                                        Most reconstituted peptides can tolerate brief periods (a few hours) at cool room
                                        temperature without significant degradation. Plan ahead to minimize time out of
                                        refrigeration.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.practiceItem}>
                                <div className={styles.practiceNumber}>
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <strong>Carry Documentation</strong>
                                    <p>
                                        If traveling by air, keep your peptides in carry-on luggage and carry any
                                        relevant prescriptions or documentation. Checked bags can experience temperature
                                        extremes in cargo holds.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Next Steps */}
                    <section className={styles.nextSteps}>
                        <h2>Continue Learning</h2>
                        <div className={styles.nextStepsGrid}>
                            <Link to="/guides/beginner" className={styles.nextStepCard}>
                                <Shield size={24} />
                                <div>
                                    <h4>Beginner's Guide</h4>
                                    <p>New to peptides? Start with the fundamentals</p>
                                </div>
                            </Link>
                            <Link to="/guides/injection" className={styles.nextStepCard}>
                                <Droplets size={24} />
                                <div>
                                    <h4>Injection Techniques</h4>
                                    <p>Step-by-step guide for safe administration</p>
                                </div>
                            </Link>
                            <Link to="/calculator" className={styles.nextStepCard}>
                                <Clock size={24} />
                                <div>
                                    <h4>Reconstitution Calculator</h4>
                                    <p>Calculate exact dosing after mixing</p>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default StorageGuide;
