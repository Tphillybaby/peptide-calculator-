import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, AlertTriangle, Shield, BookOpen, Activity, ExternalLink, Loader2 } from 'lucide-react';
import { usePeptides } from '../hooks/usePeptides';
import ReviewSection from '../components/ReviewSection';
import SEO from '../components/SEO';
import ShareButton from '../components/ShareButton';

const PeptideDetail = () => {
    const { name } = useParams();
    const { getPeptideByName, loading } = usePeptides();

    // We don't use useMemo here for the finding logic because getPeptideByName 
    // depends on state that updates (peptides list)
    const decodedName = decodeURIComponent(name);
    const peptide = getPeptideByName(decodedName);

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                <Loader2 className="spinning" size={48} color="var(--accent-primary)" />
            </div>
        );
    }

    if (!peptide) {
        return <Navigate to="/encyclopedia" replace />;
    }

    return (
        <div className="page-container">
            <SEO
                title={`${peptide.name} Protocol & Dosage Guide`}
                description={peptide.description ? peptide.description.substring(0, 160) : `Complete guide for ${peptide.name} peptide including dosage, protocols, benefits, and side effects.`}
                canonical={`/encyclopedia/${encodeURIComponent(peptide.name)}`}
                jsonLd={{
                    "@context": "https://schema.org/",
                    "@type": "Product",
                    "name": peptide.name,
                    "description": peptide.description,
                    "category": peptide.category,
                    "review": {
                        "@type": "Review",
                        "reviewRating": {
                            "@type": "Rating",
                            "ratingValue": "5",
                            "bestRating": "5"
                        },
                        "author": {
                            "@type": "Organization",
                            "name": "PeptideLog Community"
                        }
                    }
                }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Link to="/encyclopedia" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    <ArrowLeft size={20} /> Back to Encyclopedia
                </Link>
                <ShareButton
                    title={`${peptide.name} Guide - PeptideLog`}
                    text={`Check out the dosage protocol and benefits for ${peptide.name}.`}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Header Card */}
                <div className="card glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <span style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {peptide.category}
                            </span>
                            <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0 1rem 0' }}>{peptide.name}</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '800px', lineHeight: '1.6' }}>
                                {peptide.description}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                                    <Clock size={16} /> Half-Life
                                </div>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{peptide.halfLife}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                                    <Activity size={16} /> Common Dosage
                                </div>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{peptide.commonDosage}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits & Side Effects */}
                <div className="card glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Shield className="text-accent" size={24} /> Benefits
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {peptide.benefits && peptide.benefits.map((benefit, i) => (
                            <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start', color: 'var(--text-secondary)' }}>
                                <span style={{ color: '#10b981', marginTop: '0.25rem' }}>✓</span>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <AlertTriangle className="text-accent" size={24} /> Side Effects & Warnings
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {peptide.sideEffects && peptide.sideEffects.map((effect, i) => (
                            <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start', color: 'var(--text-secondary)' }}>
                                <span style={{ color: '#f59e0b', marginTop: '0.25rem' }}>!</span>
                                {effect}
                            </li>
                        ))}
                    </ul>
                    {peptide.warnings && peptide.warnings.length > 0 && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <strong style={{ color: '#ef4444', display: 'block', marginBottom: '0.5rem' }}>Important Warnings:</strong>
                            <ul style={{ paddingLeft: '1.25rem', margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {peptide.warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Protocols */}
                {peptide.protocols && peptide.protocols.length > 0 && (
                    <div className="card glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <BookOpen className="text-accent" size={24} /> Dosage Protocols
                        </h3>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {peptide.protocols.map((protocol, i) => (
                                <div key={i} style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{protocol.name}</h4>
                                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'var(--accent-primary)', color: 'white' }}>
                                                {protocol.level}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{protocol.description}</p>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        {protocol.schedule && (
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                                            <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Week</th>
                                                            <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Dose</th>
                                                            <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Frequency</th>
                                                            <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Notes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {protocol.schedule.map((row, j) => (
                                                            <tr key={j} style={{ borderBottom: j < protocol.schedule.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                                                <td style={{ padding: '0.75rem', fontWeight: '500' }}>{row.week}</td>
                                                                <td style={{ padding: '0.75rem' }}>{row.dose}</td>
                                                                <td style={{ padding: '0.75rem' }}>{row.frequency}</td>
                                                                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{row.notes}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        {protocol.notes && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#93c5fd' }}>
                                                <strong>Note:</strong> {protocol.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Research Links */}
                {peptide.researchLinks && peptide.researchLinks.length > 0 && (
                    <div className="card glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Research & Clinical Studies</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {peptide.researchLinks.map((link, i) => (
                                <a
                                    key={i}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', textDecoration: 'none' }}
                                >
                                    <ExternalLink size={16} />
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Community Reviews */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <ReviewSection peptideName={peptide.name} />
                </div>
            </div>
        </div>
    );
};

export default PeptideDetail;
