import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Edit2, Trash2, X, Save, Database,
    Clock, AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
    Copy, Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import styles from './AdminPeptides.module.css';

const CATEGORIES = [
    'Weight Loss',
    'Muscle Building',
    'Recovery',
    'Anti-Aging',
    'Cognitive',
    'Immunity',
    'Sexual Health',
    'Other'
];

const AdminPeptides = () => {
    const [peptides, setPeptides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        category: 'Weight Loss',
        half_life_hours: '',
        description: '',
        benefits: '',
        side_effects: '',
        warnings: '',
        dosage_protocols: ''
    });

    useEffect(() => {
        fetchPeptides();
    }, []);

    const fetchPeptides = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('peptides')
                .select('*')
                .order('name');

            if (error) throw error;
            setPeptides(data || []);
        } catch (error) {
            console.error('Error fetching peptides:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (peptide) => {
        setEditingId(peptide.id);
        setFormData({
            name: peptide.name,
            category: peptide.category,
            half_life_hours: peptide.half_life_hours || '',
            description: peptide.description || '',
            benefits: (peptide.benefits || []).join('\n'),
            side_effects: (peptide.side_effects || []).join('\n'),
            warnings: (peptide.warnings || []).join('\n'),
            dosage_protocols: peptide.dosage_protocols ? JSON.stringify(peptide.dosage_protocols, null, 2) : ''
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setFormData({
            name: '',
            category: 'Weight Loss',
            half_life_hours: '',
            description: '',
            benefits: '',
            side_effects: '',
            warnings: '',
            dosage_protocols: ''
        });
        setIsModalOpen(true);
    };

    const handleDuplicate = (peptide) => {
        setEditingId(null);
        setFormData({
            name: peptide.name + ' (Copy)',
            category: peptide.category,
            half_life_hours: peptide.half_life_hours || '',
            description: peptide.description || '',
            benefits: (peptide.benefits || []).join('\n'),
            side_effects: (peptide.side_effects || []).join('\n'),
            warnings: (peptide.warnings || []).join('\n'),
            dosage_protocols: peptide.dosage_protocols ? JSON.stringify(peptide.dosage_protocols, null, 2) : ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;

        try {
            const { error } = await supabase
                .from('peptides')
                .delete()
                .eq('id', id);

            if (error) throw error;
            showSuccess(`${name} deleted successfully`);
            fetchPeptides();
        } catch (error) {
            console.error('Error deleting peptide:', error);
            alert('Failed to delete peptide');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        // Parse dosage protocols JSON if provided
        let dosageProtocols = null;
        if (formData.dosage_protocols.trim()) {
            try {
                dosageProtocols = JSON.parse(formData.dosage_protocols);
            } catch (err) {
                alert('Invalid JSON in dosage protocols. Please check the format.');
                setSaving(false);
                return;
            }
        }

        const payload = {
            name: formData.name.trim(),
            category: formData.category,
            half_life_hours: formData.half_life_hours ? parseFloat(formData.half_life_hours) : null,
            description: formData.description.trim(),
            benefits: formData.benefits.split('\n').map(s => s.trim()).filter(Boolean),
            side_effects: formData.side_effects.split('\n').map(s => s.trim()).filter(Boolean),
            warnings: formData.warnings.split('\n').map(s => s.trim()).filter(Boolean),
            dosage_protocols: dosageProtocols
        };

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('peptides')
                    .update(payload)
                    .eq('id', editingId);
                if (error) throw error;
                showSuccess(`${payload.name} updated successfully`);
            } else {
                const { error } = await supabase
                    .from('peptides')
                    .insert([payload]);
                if (error) throw error;
                showSuccess(`${payload.name} created successfully`);
            }

            setIsModalOpen(false);
            fetchPeptides();
        } catch (error) {
            console.error('Error saving peptide:', error);
            alert('Failed to save peptide: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const filteredPeptides = peptides.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryCount = (category) => {
        return peptides.filter(p => p.category === category).length;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1><Database size={28} /> Manage Peptides</h1>
                    <p>{peptides.length} peptides in database</p>
                </div>
                <button className={styles.addBtn} onClick={handleAddNew}>
                    <Plus size={20} />
                    Add Peptide
                </button>
            </div>

            {successMessage && (
                <div className={styles.successBanner}>
                    <CheckCircle size={18} />
                    {successMessage}
                </div>
            )}

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search peptides..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat} ({getCategoryCount(cat)})</option>
                    ))}
                </select>
            </div>

            {/* Peptides List */}
            {loading ? (
                <div className={styles.loading}>Loading peptides...</div>
            ) : filteredPeptides.length === 0 ? (
                <div className={styles.emptyState}>
                    <Database size={48} />
                    <h3>No peptides found</h3>
                    <p>Try adjusting your search or add a new peptide.</p>
                </div>
            ) : (
                <div className={styles.peptideList}>
                    {filteredPeptides.map(peptide => (
                        <div key={peptide.id} className={styles.peptideCard}>
                            <div
                                className={styles.peptideHeader}
                                onClick={() => setExpandedId(expandedId === peptide.id ? null : peptide.id)}
                            >
                                <div className={styles.peptideInfo}>
                                    <h3>{peptide.name}</h3>
                                    <div className={styles.tags}>
                                        <span className={styles.categoryTag}>{peptide.category}</span>
                                        {peptide.half_life_hours && (
                                            <span className={styles.halfLifeTag}>
                                                <Clock size={12} />
                                                {peptide.half_life_hours}h half-life
                                            </span>
                                        )}
                                        {peptide.warnings?.length > 0 && (
                                            <span className={styles.warningTag}>
                                                <AlertTriangle size={12} />
                                                {peptide.warnings.length} warnings
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.peptideActions}>
                                    <Link
                                        to={`/encyclopedia/${encodeURIComponent(peptide.name)}`}
                                        className={styles.viewBtn}
                                        onClick={(e) => e.stopPropagation()}
                                        title="View in Encyclopedia"
                                    >
                                        <Eye size={16} />
                                    </Link>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDuplicate(peptide); }}
                                        className={styles.duplicateBtn}
                                        title="Duplicate"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(peptide); }}
                                        className={styles.editBtn}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(peptide.id, peptide.name); }}
                                        className={styles.deleteBtn}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {expandedId === peptide.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedId === peptide.id && (
                                <div className={styles.peptideDetails}>
                                    {peptide.description && (
                                        <div className={styles.detailSection}>
                                            <h4>Description</h4>
                                            <p>{peptide.description}</p>
                                        </div>
                                    )}
                                    {peptide.benefits?.length > 0 && (
                                        <div className={styles.detailSection}>
                                            <h4>Benefits</h4>
                                            <ul>
                                                {peptide.benefits.map((b, i) => <li key={i}>{b}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {peptide.side_effects?.length > 0 && (
                                        <div className={styles.detailSection}>
                                            <h4>Side Effects</h4>
                                            <ul className={styles.sideEffectsList}>
                                                {peptide.side_effects.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {peptide.dosage_protocols && (
                                        <div className={styles.detailSection}>
                                            <h4>Dosage Protocols</h4>
                                            <pre>{JSON.stringify(peptide.dosage_protocols, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingId ? 'Edit Peptide' : 'New Peptide'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g., Semaglutide"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Half Life (hours)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.half_life_hours}
                                    onChange={e => setFormData({ ...formData, half_life_hours: e.target.value })}
                                    placeholder="e.g., 168"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Brief description of the peptide..."
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Benefits (one per line)</label>
                                <textarea
                                    value={formData.benefits}
                                    onChange={e => setFormData({ ...formData, benefits: e.target.value })}
                                    rows={4}
                                    placeholder="Weight loss&#10;Improved insulin sensitivity&#10;Reduced appetite"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Side Effects (one per line)</label>
                                <textarea
                                    value={formData.side_effects}
                                    onChange={e => setFormData({ ...formData, side_effects: e.target.value })}
                                    rows={4}
                                    placeholder="Nausea&#10;Headache&#10;Injection site reactions"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Warnings (one per line)</label>
                                <textarea
                                    value={formData.warnings}
                                    onChange={e => setFormData({ ...formData, warnings: e.target.value })}
                                    rows={3}
                                    placeholder="Not for pregnant women&#10;Consult doctor before use"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Dosage Protocols (JSON format, optional)</label>
                                <textarea
                                    value={formData.dosage_protocols}
                                    onChange={e => setFormData({ ...formData, dosage_protocols: e.target.value })}
                                    rows={6}
                                    placeholder='[{"name": "Standard Protocol", "dose": "0.25mg", "frequency": "weekly"}]'
                                    className={styles.codeInput}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveBtn} disabled={saving}>
                                    <Save size={18} />
                                    {saving ? 'Saving...' : (editingId ? 'Update Peptide' : 'Create Peptide')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPeptides;
