import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, Calendar, Syringe, X, Clock, TrendingUp, Activity, Edit2, Check, ChevronDown, AlertCircle } from 'lucide-react';
import { useInjections } from '../hooks/useInjections';
import { usePeptides } from '../hooks/usePeptides';
import styles from './InjectionTracker.module.css';

const InjectionTracker = () => {
    const { injections, loading, error, addInjection, deleteInjection, updateInjection, getStats, isUsingLocalStorage } = useInjections();
    const { peptides } = usePeptides();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const autocompleteRef = useRef(null);

    const [formData, setFormData] = useState({
        peptide: '',
        dosage: '',
        unit: 'mg',
        site: 'Abdomen',
        bodyWeightKg: '',
        notes: '',
        date: new Date().toISOString().slice(0, 16) // datetime-local format
    });

    // Filter peptides for autocomplete
    const filteredPeptides = useMemo(() => {
        if (!formData.peptide) return peptides.map(p => p.name).slice(0, 8);
        const search = formData.peptide.toLowerCase();
        return peptides
            .filter(p => p.name.toLowerCase().includes(search))
            .map(p => p.name)
            .slice(0, 8);
    }, [formData.peptide, peptides]);

    // Close autocomplete when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
                setShowAutocomplete(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const stats = useMemo(() => getStats(), [getStats]);

    const resetForm = () => {
        setFormData({
            peptide: '',
            dosage: '',
            unit: 'mg',
            site: 'Abdomen',
            bodyWeightKg: '',
            notes: '',
            date: new Date().toISOString().slice(0, 16)
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.peptide || !formData.dosage) return;

        const injectionData = {
            peptide: formData.peptide,
            dosage: parseFloat(formData.dosage),
            unit: formData.unit,
            site: formData.site,
            bodyWeightKg: formData.bodyWeightKg ? parseFloat(formData.bodyWeightKg) : null,
            notes: formData.notes || '',
            date: new Date(formData.date).toISOString()
        };

        if (editingId) {
            await updateInjection(editingId, injectionData);
        } else {
            await addInjection(injectionData);
        }

        resetForm();
        setIsFormOpen(false);
    };

    const handleEdit = (injection) => {
        setFormData({
            peptide: injection.peptide,
            dosage: injection.dosage.toString(),
            unit: injection.unit,
            site: injection.site || 'Abdomen',
            bodyWeightKg: injection.bodyWeightKg?.toString() || '',
            notes: injection.notes || '',
            date: new Date(injection.date).toISOString().slice(0, 16)
        });
        setEditingId(injection.id);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirmDelete === id) {
            await deleteInjection(id);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
            // Auto-clear confirmation after 3 seconds
            setTimeout(() => setConfirmDelete(null), 3000);
        }
    };

    const selectPeptide = (name) => {
        setFormData({ ...formData, peptide: name });
        setShowAutocomplete(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = (now - date) / (1000 * 60 * 60);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
        if (diffHours < 48) return 'Yesterday';

        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading injections...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h2>Injection Tracker</h2>
                    {isUsingLocalStorage && (
                        <span className={styles.localBadge}>
                            <AlertCircle size={12} />
                            Stored locally
                        </span>
                    )}
                </div>
                <button
                    className={`btn-primary ${styles.addButton}`}
                    onClick={() => {
                        if (isFormOpen && !editingId) {
                            setIsFormOpen(false);
                        } else {
                            resetForm();
                            setIsFormOpen(true);
                        }
                    }}
                >
                    {isFormOpen && !editingId ? <X size={20} /> : <Plus size={20} />}
                    {isFormOpen && !editingId ? 'Cancel' : 'Log Shot'}
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                            <Activity size={18} color="#10b981" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.activeLevel}</span>
                            <span className={styles.statLabel}>mg active</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                            <TrendingUp size={18} color="#3b82f6" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.weeklyCount}</span>
                            <span className={styles.statLabel}>this week</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                            <Syringe size={18} color="#8b5cf6" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.totalInjections}</span>
                            <span className={styles.statLabel}>total</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className={styles.errorBanner}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Form */}
            {isFormOpen && (
                <form className={`card glass-panel ${styles.form}`} onSubmit={handleSubmit}>
                    <div className={styles.formHeader}>
                        <h3>{editingId ? 'Edit Injection' : 'Log New Injection'}</h3>
                        {editingId && (
                            <button
                                type="button"
                                className={styles.cancelEdit}
                                onClick={() => {
                                    resetForm();
                                    setIsFormOpen(false);
                                }}
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Peptide Name with Autocomplete */}
                    <div className={styles.inputGroup} ref={autocompleteRef}>
                        <label>Peptide Name *</label>
                        <div className={styles.autocompleteWrapper}>
                            <input
                                type="text"
                                placeholder="Type or search peptide..."
                                value={formData.peptide}
                                onChange={e => setFormData({ ...formData, peptide: e.target.value })}
                                onFocus={() => setShowAutocomplete(true)}
                                required
                                autoComplete="off"
                            />
                            <ChevronDown
                                size={18}
                                className={`${styles.chevron} ${showAutocomplete ? styles.chevronUp : ''}`}
                            />
                            {showAutocomplete && filteredPeptides.length > 0 && (
                                <div className={styles.autocomplete}>
                                    {filteredPeptides.map(name => (
                                        <button
                                            key={name}
                                            type="button"
                                            className={styles.autocompleteItem}
                                            onClick={() => selectPeptide(name)}
                                        >
                                            <span>{name}</span>
                                            <span className={styles.peptideCategory}>
                                                {peptides.find(p => p.name === name)?.category}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dosage Row */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Dosage *</label>
                            <input
                                type="number"
                                step="0.001"
                                min="0"
                                placeholder="0.25"
                                value={formData.dosage}
                                onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Unit</label>
                            <select
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option value="mg">mg</option>
                                <option value="mcg">mcg</option>
                                <option value="iu">IU</option>
                            </select>
                        </div>
                    </div>

                    {/* Date & Time Row */}
                    <div className={styles.inputGroup}>
                        <label>
                            <Calendar size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            max={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    {/* Injection Site */}
                    <div className={styles.inputGroup}>
                        <label>Injection Site</label>
                        <div className={styles.siteButtons}>
                            {['Abdomen', 'Thigh', 'Arm', 'Glute'].map(site => (
                                <button
                                    key={site}
                                    type="button"
                                    className={`${styles.siteButton} ${formData.site === site ? styles.siteActive : ''}`}
                                    onClick={() => setFormData({ ...formData, site })}
                                >
                                    {site}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Body Weight (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Optional"
                                value={formData.bodyWeightKg}
                                onChange={e => setFormData({ ...formData, bodyWeightKg: e.target.value })}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Notes</label>
                            <input
                                type="text"
                                placeholder="Optional"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
                        {editingId ? (
                            <><Check size={18} /> Update Entry</>
                        ) : (
                            <><Plus size={18} /> Save Entry</>
                        )}
                    </button>
                </form>
            )}

            {/* Injection List */}
            <div className={styles.list}>
                {injections.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <Syringe size={48} />
                        </div>
                        <h3>No Injections Logged</h3>
                        <p>Start tracking your peptide injections to monitor your protocol progress.</p>
                        <button
                            className="btn-primary"
                            onClick={() => {
                                resetForm();
                                setIsFormOpen(true);
                            }}
                        >
                            <Plus size={18} /> Log Your First Shot
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.listHeader}>
                            <span>Recent Injections</span>
                            <span className={styles.count}>{injections.length} total</span>
                        </div>
                        {injections.map(injection => (
                            <div key={injection.id} className={`card ${styles.item}`}>
                                <div className={styles.itemMain}>
                                    <div className={styles.itemPeptide}>
                                        <span className={styles.peptideName}>{injection.peptide}</span>
                                        <span className={styles.dosageBadge}>
                                            {injection.dosage}{injection.unit}
                                        </span>
                                    </div>
                                    <div className={styles.itemMeta}>
                                        <span className={styles.date}>
                                            <Calendar size={12} />
                                            {formatDate(injection.date)}
                                        </span>
                                        <span className={styles.time}>
                                            <Clock size={12} />
                                            {formatTime(injection.date)}
                                        </span>
                                        <span className={styles.site}>{injection.site}</span>
                                    </div>
                                    {injection.notes && (
                                        <p className={styles.notes}>{injection.notes}</p>
                                    )}
                                </div>
                                <div className={styles.itemActions}>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => handleEdit(injection)}
                                        aria-label="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className={`${styles.deleteBtn} ${confirmDelete === injection.id ? styles.confirmDelete : ''}`}
                                        onClick={() => handleDelete(injection.id)}
                                        aria-label={confirmDelete === injection.id ? 'Confirm delete' : 'Delete'}
                                    >
                                        {confirmDelete === injection.id ? (
                                            <Check size={16} />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default InjectionTracker;
