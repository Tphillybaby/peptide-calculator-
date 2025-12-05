import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Beaker, Activity, Brain, Heart, Zap, BookOpen } from 'lucide-react';
import { getAllPeptides, getPeptidesByCategory } from '../data/peptideDatabase';

const Encyclopedia = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const peptides = useMemo(() => getAllPeptides(), []);
    const categories = useMemo(() => ['All', ...new Set(peptides.map(p => p.category))], [peptides]);

    const filteredPeptides = useMemo(() => {
        return peptides.filter(peptide => {
            const matchesSearch = peptide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                peptide.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || peptide.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [peptides, searchTerm, selectedCategory]);

    const getCategoryIcon = (category) => {
        if (category.includes('GLP-1') || category.includes('Metabolic')) return <Activity size={20} />;
        if (category.includes('Healing')) return <Heart size={20} />;
        if (category.includes('Cognitive')) return <Brain size={20} />;
        if (category.includes('Growth')) return <Zap size={20} />;
        return <Beaker size={20} />;
    };

    return (
        <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Peptide Encyclopedia</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
                    Explore our comprehensive database of peptides, protocols, and scientific research.
                </p>
                <Link to="/guides" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <BookOpen size={18} /> View Safety & Protocol Guides
                </Link>
            </div>

            {/* Search and Filter */}
            <div className="card glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search peptides, benefits, or descriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ minWidth: '200px' }}>
                        <div style={{ position: 'relative' }}>
                            <Filter size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    appearance: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredPeptides.map(peptide => (
                    <Link to={`/encyclopedia/${encodeURIComponent(peptide.name)}`} key={peptide.name} style={{ textDecoration: 'none' }}>
                        <div className="card glass-panel" style={{
                            height: '100%',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s, border-color 0.2s',
                            cursor: 'pointer'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div style={{
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6'
                                }}>
                                    {getCategoryIcon(peptide.category)}
                                </div>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    {peptide.category}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>{peptide.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem', flex: 1 }}>
                                {peptide.description.length > 100 ? peptide.description.substring(0, 100) + '...' : peptide.description}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: '500' }}>
                                View Protocol <ArrowRight size={16} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredPeptides.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <Beaker size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No peptides found</h3>
                    <p>Try adjusting your search or category filter.</p>
                </div>
            )}
        </div>
    );
};

export default Encyclopedia;
