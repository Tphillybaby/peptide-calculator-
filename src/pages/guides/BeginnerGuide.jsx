import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BeginnerGuide = () => {
    return (
        <div className="page-container">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem' }}>
                    <ArrowLeft size={20} /> Back to Guides
                </Link>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Beginner's Protocol Guide</h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '3rem' }}>
                    Starting your peptide journey can be overwhelming. This guide breaks down the essential steps for a safe and effective start.
                </p>

                <div className="card glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Step 1: Research & Sourcing</h2>
                    <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Not all peptides are created equal. The most critical step is sourcing high-purity peptides (99%+) from a vendor that provides <strong>COAs (Certificates of Analysis)</strong> from third-party labs.
                    </p>
                    <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
                        <strong>Tip:</strong> Check our Encyclopedia for specific peptide details before buying.
                    </div>
                </div>

                <div className="card glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Step 2: Supplies Checklist</h2>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input type="checkbox" checked readOnly style={{ accentColor: '#10b981' }} />
                            <span><strong>Bacteriostatic Water:</strong> For reconstituting the powder.</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input type="checkbox" checked readOnly style={{ accentColor: '#10b981' }} />
                            <span><strong>Insulin Syringes:</strong> 31G or 30G, 1ml or 0.5ml size.</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input type="checkbox" checked readOnly style={{ accentColor: '#10b981' }} />
                            <span><strong>Alcohol Swabs:</strong> To sterilize vials and skin.</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input type="checkbox" checked readOnly style={{ accentColor: '#10b981' }} />
                            <span><strong>Sharps Container:</strong> For safe disposal.</span>
                        </li>
                    </ul>
                </div>

                <div className="card glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Step 3: Reconstitution</h2>
                    <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        This is the process of mixing the water with the powder.
                    </p>
                    <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                        <li style={{ marginBottom: '0.5rem' }}>Pop the caps off the peptide vial and water vial.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Wipe both rubber stoppers with alcohol.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Draw the desired amount of water (usually 1ml or 2ml) into a syringe.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Slowly inject the water into the peptide vial. Aim for the glass wall, not the powder directly.</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Do not shake!</strong> Gently swirl the vial until dissolved.</li>
                    </ol>
                    <div style={{ marginTop: '1.5rem' }}>
                        <Link to="/calculator" className="btn-primary">Use Reconstitution Calculator</Link>
                    </div>
                </div>

                <div className="card glass-panel" style={{ padding: '2.5rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Step 4: Starting Low</h2>
                    <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                        Always start with the lowest effective dose to assess tolerance. Most side effects occur when users rush the titration process. Patience is key.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BeginnerGuide;
