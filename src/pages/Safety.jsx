import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Thermometer, Syringe, CheckCircle, ArrowLeft } from 'lucide-react';

const Safety = () => {
    return (
        <div className="page-container">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem' }}>
                    <ArrowLeft size={20} /> Back to Guides
                </Link>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Safety & Storage Guide</h1>

                {/* Critical Warning */}
                <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <AlertTriangle className="text-error" size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>Medical Disclaimer</h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                This information is for educational purposes only. Always consult with a healthcare professional before starting any peptide protocol.
                                Ensure you source peptides from reputable vendors that provide third-party testing (COA).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Storage Section */}
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Thermometer className="text-accent" size={28} />
                        Storage Guidelines
                    </h2>
                    <div className="card glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Lyophilized (Powder) Peptides</h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
                                    <li style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                        <CheckCircle size={20} style={{ color: '#10b981', marginTop: '2px' }} />
                                        <span>Store in a cool, dry place away from light (room temp is usually fine for short term).</span>
                                    </li>
                                    <li style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                        <CheckCircle size={20} style={{ color: '#10b981', marginTop: '2px' }} />
                                        <span>For long-term storage (&gt;1 month), keep in the freezer (-20°C).</span>
                                    </li>
                                </ul>
                            </div>
                            <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Reconstituted (Liquid) Peptides</h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
                                    <li style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                        <CheckCircle size={20} style={{ color: '#10b981', marginTop: '2px' }} />
                                        <span><strong>ALWAYS</strong> store in the refrigerator (2-8°C).</span>
                                    </li>
                                    <li style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                        <CheckCircle size={20} style={{ color: '#10b981', marginTop: '2px' }} />
                                        <span>Do not freeze reconstituted peptides as it can damage the structure.</span>
                                    </li>
                                    <li style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                        <CheckCircle size={20} style={{ color: '#10b981', marginTop: '2px' }} />
                                        <span>Most peptides degrade after 30-60 days in solution. Check specific peptide info.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Injection Section */}
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Syringe className="text-accent" size={28} />
                        Safe Injection Practices
                    </h2>
                    <div className="card glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Subcutaneous (SubQ) Injection</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Most peptides are injected into the subcutaneous fat layer, typically in the abdomen.
                            </p>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Prepare</h4>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Wash hands thoroughly. Wipe the vial top with an alcohol swab.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Draw</h4>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Inject air into the vial equal to your dose. Draw the liquid slowly to avoid bubbles.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Inject</h4>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Clean skin with alcohol. Pinch a fold of fat (abdomen). Insert needle at 45-90 degree angle. Inject slowly.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Disposal */}
                <section>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Shield className="text-accent" size={28} />
                        Disposal
                    </h2>
                    <div className="card glass-panel" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.6)' }}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                            Always dispose of used needles and syringes in a dedicated <strong>Sharps Container</strong>.
                            Never throw loose needles in the trash. You can buy sharps containers at any pharmacy.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Safety;
