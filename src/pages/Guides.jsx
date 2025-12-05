import React from 'react';
import { BookOpen, Shield, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const GuideCard = ({ title, description, icon: Icon, link, color }) => (
    <Link to={link} style={{ textDecoration: 'none' }}>
        <div className="card glass-panel" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${color}20`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
            }}>
                <Icon size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                {description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: color, fontWeight: '500' }}>
                Read Guide <ArrowRight size={16} />
            </div>
        </div>
    </Link >
);

const Guides = () => {
    return (
        <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Peptide Guides</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
                    Expert-curated resources to help you understand protocols, safety, and best practices.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <GuideCard
                    title="Beginner's Protocol"
                    description="Everything you need to know about starting your first peptide cycle. Dosing, timing, and what to expect."
                    icon={BookOpen}
                    link="/guides/beginner"
                    color="#3b82f6"
                />
                <GuideCard
                    title="Safety & Storage"
                    description="Critical information on reconstitution, bacteriostatic water, and proper storage temperatures."
                    icon={Shield}
                    link="/safety"
                    color="#10b981"
                />
                <GuideCard
                    title="Injection Techniques"
                    description="Step-by-step visual guide for subcutaneous and intramuscular injections."
                    icon={Activity}
                    link="/guides/injection"
                    color="#f59e0b"
                />
            </div>

            <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Frequently Asked Questions</h2>
                <div className="card glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>How do I mix my peptides?</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Check out our <Link to="/guides/beginner" style={{ color: 'var(--accent-primary)' }}>Beginner's Guide</Link> for a step-by-step walkthrough on reconstitution.
                        </p>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>Where should I store them?</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Powder vials can be stored in the freezer. Once mixed with water, they <strong>must</strong> be kept in the refrigerator. See our <Link to="/safety" style={{ color: 'var(--accent-primary)' }}>Safety Guide</Link>.
                        </p>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>How long do they last?</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Most reconstituted peptides are stable for 30-60 days in the fridge. Unmixed powder can last for years in the freezer.
                        </p>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>Are these legal?</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Peptides are for research purposes only. Laws vary by country. Always consult with a qualified healthcare professional.
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ padding: '2rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                    <div style={{ padding: '1rem', background: '#3b82f6', borderRadius: '50%', color: 'white' }}>
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Looking for specific peptide info?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Check out our comprehensive Encyclopedia for detailed breakdowns of individual peptides.
                        </p>
                        <Link to="/encyclopedia" className="btn-primary">
                            Visit Encyclopedia
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Guides;
