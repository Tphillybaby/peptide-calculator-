import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Syringe } from 'lucide-react';
import { useInjections } from '../hooks/useInjections';
import styles from './InjectionTracker.module.css';

const InjectionTracker = () => {
    const { injections, addInjection, deleteInjection } = useInjections();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [formData, setFormData] = useState({
        peptide: '',
        dosage: '',
        unit: 'mg',
        site: 'Abdomen',
        bodyWeightKg: '',
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.peptide || !formData.dosage) return;

        addInjection({
            peptide: formData.peptide,
            dosage: parseFloat(formData.dosage),
            unit: formData.unit,
            site: formData.site,
            bodyWeightKg: formData.bodyWeightKg ? parseFloat(formData.bodyWeightKg) : null,
            notes: formData.notes || '',
            date: new Date().toISOString()
        });

        setFormData({ peptide: '', dosage: '', unit: 'mg', site: 'Abdomen', bodyWeightKg: '', notes: '' });
        setIsFormOpen(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Injection History</h2>
                <button
                    className="btn-primary"
                    onClick={() => setIsFormOpen(!isFormOpen)}
                >
                    <Plus size={20} /> Log Shot
                </button>
            </div>

            {isFormOpen && (
                <form className={`card glass-panel ${styles.form}`} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Peptide Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Semaglutide"
                            value={formData.peptide}
                            onChange={e => setFormData({ ...formData, peptide: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Dosage</label>
                            <input
                                type="number"
                                step="0.01"
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

                    <div className={styles.inputGroup}>
                        <label>Injection Site</label>
                        <select
                            value={formData.site}
                            onChange={e => setFormData({ ...formData, site: e.target.value })}
                        >
                            <option value="Abdomen">Abdomen</option>
                            <option value="Thigh">Thigh</option>
                            <option value="Arm">Arm</option>
                            <option value="Glute">Glute</option>
                        </select>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Body Weight (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="80"
                                value={formData.bodyWeightKg}
                                onChange={e => setFormData({ ...formData, bodyWeightKg: e.target.value })}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Notes</label>
                            <input
                                type="text"
                                placeholder="e.g., pre-breakfast"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Save Entry
                    </button>
                </form>
            )}

            <div className={styles.list}>
                {injections.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Syringe size={48} color="var(--text-muted)" />
                        <p>No injections logged yet.</p>
                    </div>
                ) : (
                    injections.map(injection => (
                        <div key={injection.id} className={`card ${styles.item}`}>
                            <div className={styles.itemLeft}>
                                <span className={styles.date}>
                                    {new Date(injection.date).toLocaleDateString()}
                                </span>
                                <span className={styles.peptide}>{injection.peptide}</span>
                                <span className={styles.details}>
                                    {injection.dosage}{injection.unit} • {injection.site}
                                </span>
                            </div>
                            <button
                                className={styles.deleteBtn}
                                onClick={() => deleteInjection(injection.id)}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InjectionTracker;
