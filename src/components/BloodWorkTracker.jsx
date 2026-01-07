import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Plus, TrendingUp, TrendingDown, AlertTriangle, Lock, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from './BloodWorkTracker.module.css';

// Blood marker definitions with reference ranges
const bloodMarkers = {
    hormones: [
        { id: 'igf1', name: 'IGF-1', unit: 'ng/mL', min: 100, max: 300, description: 'Growth factor indicator' },
        { id: 'testosterone', name: 'Testosterone', unit: 'ng/dL', min: 300, max: 1000, description: 'Primary male hormone' },
        { id: 'free_t', name: 'Free Testosterone', unit: 'pg/mL', min: 50, max: 210, description: 'Bioavailable testosterone' },
        { id: 'estradiol', name: 'Estradiol (E2)', unit: 'pg/mL', min: 10, max: 40, description: 'Estrogen level' },
        { id: 'shbg', name: 'SHBG', unit: 'nmol/L', min: 10, max: 57, description: 'Sex hormone binding globulin' },
        { id: 'lh', name: 'LH', unit: 'mIU/mL', min: 1.7, max: 8.6, description: 'Luteinizing hormone' },
        { id: 'fsh', name: 'FSH', unit: 'mIU/mL', min: 1.5, max: 12.4, description: 'Follicle stimulating hormone' },
        { id: 'prolactin', name: 'Prolactin', unit: 'ng/mL', min: 2, max: 18, description: 'Pituitary hormone' },
        { id: 'cortisol', name: 'Cortisol', unit: 'mcg/dL', min: 6, max: 23, description: 'Stress hormone' },
        { id: 'thyroid_tsh', name: 'TSH', unit: 'mIU/L', min: 0.4, max: 4.0, description: 'Thyroid stimulating hormone' },
        { id: 'thyroid_t3', name: 'Free T3', unit: 'pg/mL', min: 2.3, max: 4.2, description: 'Active thyroid hormone' },
        { id: 'thyroid_t4', name: 'Free T4', unit: 'ng/dL', min: 0.8, max: 1.8, description: 'Thyroid hormone' },
    ],
    metabolic: [
        { id: 'glucose', name: 'Fasting Glucose', unit: 'mg/dL', min: 70, max: 100, description: 'Blood sugar level' },
        { id: 'hba1c', name: 'HbA1c', unit: '%', min: 4.0, max: 5.6, description: '3-month glucose average' },
        { id: 'insulin', name: 'Fasting Insulin', unit: 'μIU/mL', min: 2.6, max: 24.9, description: 'Insulin level' },
        { id: 'homa_ir', name: 'HOMA-IR', unit: '', min: 0, max: 2.5, description: 'Insulin resistance index' },
    ],
    lipids: [
        { id: 'cholesterol', name: 'Total Cholesterol', unit: 'mg/dL', min: 0, max: 200, description: 'Total cholesterol' },
        { id: 'ldl', name: 'LDL', unit: 'mg/dL', min: 0, max: 100, description: 'Bad cholesterol' },
        { id: 'hdl', name: 'HDL', unit: 'mg/dL', min: 40, max: 999, description: 'Good cholesterol' },
        { id: 'triglycerides', name: 'Triglycerides', unit: 'mg/dL', min: 0, max: 150, description: 'Blood fats' },
    ],
    liver: [
        { id: 'alt', name: 'ALT', unit: 'U/L', min: 7, max: 56, description: 'Liver enzyme' },
        { id: 'ast', name: 'AST', unit: 'U/L', min: 10, max: 40, description: 'Liver enzyme' },
        { id: 'ggt', name: 'GGT', unit: 'U/L', min: 9, max: 48, description: 'Liver enzyme' },
        { id: 'albumin', name: 'Albumin', unit: 'g/dL', min: 3.5, max: 5.5, description: 'Protein level' },
    ],
    kidney: [
        { id: 'creatinine', name: 'Creatinine', unit: 'mg/dL', min: 0.7, max: 1.3, description: 'Kidney function' },
        { id: 'bun', name: 'BUN', unit: 'mg/dL', min: 7, max: 20, description: 'Blood urea nitrogen' },
        { id: 'egfr', name: 'eGFR', unit: 'mL/min', min: 90, max: 999, description: 'Kidney filtration rate' },
    ],
    blood: [
        { id: 'hemoglobin', name: 'Hemoglobin', unit: 'g/dL', min: 13.5, max: 17.5, description: 'Oxygen carrying capacity' },
        { id: 'hematocrit', name: 'Hematocrit', unit: '%', min: 38.8, max: 50, description: 'Red blood cell percentage' },
        { id: 'rbc', name: 'RBC Count', unit: 'M/uL', min: 4.5, max: 5.5, description: 'Red blood cell count' },
        { id: 'wbc', name: 'WBC Count', unit: 'K/uL', min: 4.5, max: 11.0, description: 'White blood cell count' },
        { id: 'platelets', name: 'Platelets', unit: 'K/uL', min: 150, max: 400, description: 'Clotting cells' },
    ],
};

import UpgradeModal from './UpgradeModal';

const BloodWorkTracker = ({ isPremium = false }) => {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('hormones');
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [newEntry, setNewEntry] = useState({ date: new Date().toISOString().split('T')[0], values: {} });
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Check if premium feature
    if (!isPremium) {
        return (
            <div className={styles.premiumGate}>
                <div className={styles.premiumCard}>
                    <Lock size={48} className={styles.lockIcon} />
                    <h2>Premium Feature</h2>
                    <p>Blood Work Tracker is a premium feature that allows you to:</p>
                    <ul>
                        <li>Track 50+ blood markers over time</li>
                        <li>Visualize trends with interactive charts</li>
                        <li>Get alerts when values are out of range</li>
                        <li>Export reports for your doctor</li>
                        <li>Correlate with your peptide protocols</li>
                    </ul>
                    <button
                        className={styles.upgradeBtn}
                        onClick={() => setShowUpgradeModal(true)}
                    >
                        Upgrade to Premium
                    </button>
                </div>
                <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            </div>
        );
    }

    useEffect(() => {
        if (user) {
            fetchEntries();
        }
    }, [user]);

    const fetchEntries = async () => {
        try {
            const { data, error } = await supabase
                .from('blood_work')
                .select('*')
                .eq('user_id', user.id)
                .order('test_date', { ascending: false });

            if (error) throw error;
            setEntries(data || []);
        } catch (err) {
            console.error('Error fetching blood work:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEntry = async () => {
        try {
            const { error } = await supabase
                .from('blood_work')
                .insert({
                    user_id: user.id,
                    test_date: newEntry.date,
                    values: newEntry.values,
                });

            if (error) throw error;

            setShowAddModal(false);
            setNewEntry({ date: new Date().toISOString().split('T')[0], values: {} });
            fetchEntries();
        } catch (err) {
            console.error('Error adding entry:', err);
        }
    };

    const getMarkerStatus = (value, marker) => {
        if (value < marker.min) return 'low';
        if (value > marker.max) return 'high';
        return 'normal';
    };

    const getChartData = (markerId) => {
        return entries
            .filter(e => e.values && e.values[markerId])
            .map(e => ({
                date: new Date(e.test_date).toLocaleDateString(),
                value: parseFloat(e.values[markerId]),
            }))
            .reverse();
    };

    const markers = bloodMarkers[selectedCategory] || [];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Blood Work Tracker</h1>
                    <p className={styles.subtitle}>Track and visualize your lab results over time</p>
                </div>
                <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    Add Results
                </button>
            </div>

            <div className={styles.categories}>
                {Object.keys(bloodMarkers).map(cat => (
                    <button
                        key={cat}
                        className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.active : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            <div className={styles.markersGrid}>
                {markers.map(marker => {
                    const latestEntry = entries.find(e => e.values?.[marker.id]);
                    const latestValue = latestEntry?.values?.[marker.id];
                    const status = latestValue ? getMarkerStatus(parseFloat(latestValue), marker) : null;
                    const chartData = getChartData(marker.id);

                    return (
                        <div
                            key={marker.id}
                            className={`${styles.markerCard} ${selectedMarker?.id === marker.id ? styles.selected : ''}`}
                            onClick={() => setSelectedMarker(marker)}
                        >
                            <div className={styles.markerHeader}>
                                <span className={styles.markerName}>{marker.name}</span>
                                {status && (
                                    <span className={`${styles.status} ${styles[status]}`}>
                                        {status === 'high' && <TrendingUp size={14} />}
                                        {status === 'low' && <TrendingDown size={14} />}
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                )}
                            </div>

                            <div className={styles.markerValue}>
                                {latestValue ? (
                                    <>
                                        <span className={styles.value}>{latestValue}</span>
                                        <span className={styles.unit}>{marker.unit}</span>
                                    </>
                                ) : (
                                    <span className={styles.noData}>No data</span>
                                )}
                            </div>

                            <div className={styles.markerRange}>
                                Range: {marker.min} - {marker.max} {marker.unit}
                            </div>

                            {chartData.length > 1 && (
                                <div className={styles.miniChart}>
                                    <ResponsiveContainer width="100%" height={40}>
                                        <LineChart data={chartData}>
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="var(--accent-primary)"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedMarker && (
                <div className={styles.detailPanel}>
                    <h2>{selectedMarker.name} History</h2>
                    <p className={styles.markerDesc}>{selectedMarker.description}</p>

                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={getChartData(selectedMarker.id)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--glass-bg)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <ReferenceLine y={selectedMarker.min} stroke="var(--warning)" strokeDasharray="5 5" label="Min" />
                                <ReferenceLine y={selectedMarker.max} stroke="var(--warning)" strokeDasharray="5 5" label="Max" />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="var(--accent-primary)"
                                    strokeWidth={2}
                                    dot={{ fill: 'var(--accent-primary)' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Add Entry Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>Add Blood Work Results</h2>

                        <div className={styles.formGroup}>
                            <label>Test Date</label>
                            <input
                                type="date"
                                value={newEntry.date}
                                onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                            />
                        </div>

                        <div className={styles.markersInput}>
                            {Object.entries(bloodMarkers).map(([category, markers]) => (
                                <div key={category} className={styles.categorySection}>
                                    <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                                    <div className={styles.inputGrid}>
                                        {markers.map(marker => (
                                            <div key={marker.id} className={styles.inputItem}>
                                                <label>{marker.name}</label>
                                                <div className={styles.inputWithUnit}>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder={`${marker.min}-${marker.max}`}
                                                        value={newEntry.values[marker.id] || ''}
                                                        onChange={e => setNewEntry({
                                                            ...newEntry,
                                                            values: { ...newEntry.values, [marker.id]: e.target.value }
                                                        })}
                                                    />
                                                    <span>{marker.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className={styles.saveBtn} onClick={handleAddEntry}>
                                Save Results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BloodWorkTracker;
