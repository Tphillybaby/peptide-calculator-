import React from 'react';
import { ArrowLeft, Syringe, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const InjectionGuide = () => {
    return (
        <>
            <SEO
                title="Injection Techniques Guide | Safe Peptide Administration"
                description="Step-by-step visual guide to safe subcutaneous injections. Learn proper technique, injection sites, and best practices."
                canonical="/guides/injection"
            />
            <div className="page-container">
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Link to="/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem' }}>
                        <ArrowLeft size={20} /> Back to Guides
                    </Link>

                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Injection Techniques</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '3rem' }}>
                        A step-by-step visual guide to performing safe and painless subcutaneous injections.
                    </p>

                    <div className="card glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <Syringe className="text-accent" size={24} />
                            Where to Inject (Subcutaneous)
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                            <div>
                                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    The most common site is the <strong>abdomen</strong>, at least 2 inches away from the belly button.
                                </p>
                                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                    <li>Abdomen (preferred)</li>
                                    <li>Outer thigh</li>
                                    <li>Back of the upper arm</li>
                                </ul>
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid #f59e0b' }}>
                                    <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '0.5rem' }}>Rotate Sites!</strong>
                                    Don't inject in the exact same spot every time to prevent scar tissue buildup.
                                </div>
                            </div>
                            <div style={{
                                height: '300px',
                                background: 'rgba(15, 23, 42, 0.5)',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--glass-border)'
                            }}>
                                {/* Placeholder for an anatomical diagram */}
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧍</div>
                                    <p>Anatomical Diagram Placeholder</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card glass-panel" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '2rem' }}>The 4-Step Process</h2>

                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--accent-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0
                                }}>1</div>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Pinch</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        Gently pinch a 1-2 inch fold of skin/fat between your thumb and forefinger. This pulls the fatty tissue away from the muscle.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--accent-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0
                                }}>2</div>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Insert</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        Hold the syringe like a dart. Insert the needle quickly and firmly at a <strong>45 to 90-degree angle</strong> into the pinched skin.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--accent-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0
                                }}>3</div>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Push</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        Slowly push the plunger all the way down. Wait 5 seconds after injecting to ensure all liquid is absorbed.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--accent-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0
                                }}>4</div>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Release</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        Remove the needle at the same angle it went in. Release the skin fold. Do not rub the area. Dispose of the needle in your sharps container.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommended Supplies */}
                    <div className="card glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            🛒 Recommended Supplies
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Everything you need for safe, sterile injections.
                        </p>

                        <a
                            href="https://amzn.to/4wy1UeP"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.25rem',
                                background: 'rgba(255, 153, 0, 0.08)',
                                border: '1px solid rgba(255, 153, 0, 0.25)',
                                borderRadius: '0.75rem',
                                textDecoration: 'none',
                                gap: '1rem',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.75rem' }}>🧴</span>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                                        Alcohol Wipes (Isopropyl 70%)
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        Sterile prep wipes for vial tops &amp; injection sites
                                    </div>
                                </div>
                            </div>
                            <div style={{ color: '#ff9900', fontWeight: '600', fontSize: '0.875rem', flexShrink: 0 }}>
                                View on Amazon ↗
                            </div>
                        </a>

                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                            As an Amazon Associate, PeptideLog earns from qualifying purchases.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InjectionGuide;
