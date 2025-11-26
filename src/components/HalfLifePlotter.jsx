import React, { useState, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useInjections } from '../hooks/useInjections';
import { Activity } from 'lucide-react';
import styles from './HalfLifePlotter.module.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const PEPTIDE_CATEGORIES = {
    'GLP-1 Agonists & Weight Loss': {
        'Semaglutide': 168,
        'Tirzepatide': 120,
        'Retatrutide': 144,
        'Liraglutide': 13,
        'Dulaglutide': 120,
        'Exenatide': 2.4
    },
    'Growth Hormone Secretagogues': {
        'CJC-1295 (no DAC)': 0.5,
        'CJC-1295 (DAC)': 168,
        'Ipamorelin': 2,
        'GHRP-2': 0.5,
        'GHRP-6': 0.5,
        'Hexarelin': 1.5,
        'MK-677 (Ibutamoren)': 24
    },
    'Healing & Recovery': {
        'BPC-157': 4,
        'TB-500': 120,
        'Thymosin Alpha-1': 3,
        'Thymosin Beta-4': 24,
        'GHK-Cu': 1
    },
    'Cosmetic & Skin': {
        'Melanotan I': 1,
        'Melanotan II': 1,
        'PT-141 (Bremelanotide)': 3,
        'GHK-Cu (Copper Peptide)': 1
    },
    'Performance & Muscle': {
        'IGF-1 LR3': 24,
        'IGF-1 DES': 0.5,
        'Follistatin 344': 48,
        'ACE-031': 168,
        'YK-11': 12
    },
    'Cognitive & Nootropic': {
        'Semax': 1,
        'Selank': 0.5,
        'Cerebrolysin': 2.5,
        'P21': 3,
        'Dihexa': 2
    },
    'Metabolic & Other': {
        'AOD-9604': 0.5,
        'MOTS-c': 2,
        'Epithalon': 2,
        'Pinealon': 2,
        'SS-31 (Elamipretide)': 4
    }
};

// Flatten for easy lookup
const PEPTIDE_PRESETS = Object.values(PEPTIDE_CATEGORIES).reduce((acc, category) => {
    return { ...acc, ...category };
}, { 'Custom': 24 });

const convertDose = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    const mgToMcg = (val) => val * 1000;
    const mcgToMg = (val) => val / 1000;
    // IU conversion is compound-specific; leave as-is if not matching
    if (fromUnit === 'mg' && toUnit === 'mcg') return mgToMcg(value);
    if (fromUnit === 'mcg' && toUnit === 'mg') return mcgToMg(value);
    return value;
};

const HalfLifePlotter = () => {
    const { injections } = useInjections();
    const [selectedPeptide, setSelectedPeptide] = useState('Semaglutide');
    const [customHalfLife, setCustomHalfLife] = useState(24);
    const [daysToProject, setDaysToProject] = useState(30);
    const [weightKg, setWeightKg] = useState('');
    const [doseUnit, setDoseUnit] = useState('mg');

    const halfLifeHours = selectedPeptide === 'Custom' ? customHalfLife : PEPTIDE_PRESETS[selectedPeptide];

    const chartData = useMemo(() => {
        if (injections.length === 0) return null;

        // Filter injections by selected peptide name (simple matching)
        // If 'Custom', we might want to show all or let user filter. 
        // For now, let's filter by the selected preset name if it's not Custom.
        const relevantInjections = selectedPeptide === 'Custom'
            ? injections
            : injections.filter(i => i.peptide.toLowerCase().includes(selectedPeptide.toLowerCase()));

        if (relevantInjections.length === 0) return null;

        // Generate time points (daily for now)
        const now = new Date();
        const startDate = new Date(Math.min(...relevantInjections.map(i => new Date(i.date))));
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + daysToProject);

        const labels = [];
        const dataPoints = [];

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            labels.push(currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

            // Calculate total active amount at this time point
            let totalActive = 0;
            const currentTime = currentDate.getTime();

            relevantInjections.forEach(inj => {
                const injTime = new Date(inj.date).getTime();
                if (injTime <= currentTime) {
                    const elapsedHours = (currentTime - injTime) / (1000 * 60 * 60);
                    const normalizedDose = inj.unit === doseUnit
                        ? inj.dosage
                        : convertDose(inj.dosage, inj.unit, doseUnit);
                    const remaining = normalizedDose * Math.pow(0.5, elapsedHours / halfLifeHours);
                    totalActive += remaining;
                }
            });

            dataPoints.push(totalActive);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Estimated Active Level (mg)',
                    data: dataPoints,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 2,
                },
            ],
        };
    }, [injections, halfLifeHours, daysToProject, selectedPeptide]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#94a3b8',
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#94a3b8',
                    maxTicksLimit: 8,
                },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className={styles.controlGroup}>
                    <label>Peptide Profile</label>
                    <select
                        value={selectedPeptide}
                        onChange={(e) => setSelectedPeptide(e.target.value)}
                    >
                        {Object.entries(PEPTIDE_CATEGORIES).map(([category, peptides]) => (
                            <optgroup key={category} label={category}>
                                {Object.keys(peptides).map(peptide => (
                                    <option key={peptide} value={peptide}>{peptide}</option>
                                ))}
                            </optgroup>
                        ))}
                        <option value="Custom">Custom</option>
                    </select>
                </div>

                {selectedPeptide === 'Custom' && (
                    <div className={styles.controlGroup}>
                        <label>Half-Life (Hours)</label>
                        <input
                            type="number"
                            value={customHalfLife}
                            onChange={(e) => setCustomHalfLife(Number(e.target.value))}
                            onWheel={(e) => e.target.blur()}
                        />
                    </div>
                )}

                <div className={styles.controlGroup}>
                    <label>Dose Unit</label>
                    <select value={doseUnit} onChange={(e) => setDoseUnit(e.target.value)}>
                        <option value="mg">mg</option>
                        <option value="mcg">mcg</option>
                        <option value="iu">IU</option>
                    </select>
                </div>

                <div className={styles.controlGroup}>
                    <label>Body Weight (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="80"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                    />
                </div>
            </div>

            <div className="card glass-panel">
                <div className={styles.chartHeader}>
                    <Activity size={20} color="var(--accent-primary)" />
                    <h3>Decay Plotter</h3>
                    <div className={styles.summary}>
                        <span>Entries: {injections.length}</span>
                        <span>Unit: {doseUnit}</span>
                        {weightKg && <span>Weight: {weightKg} kg</span>}
                    </div>
                </div>

                <div className={styles.chartContainer}>
                    {chartData ? (
                        <Line data={chartData} options={options} />
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No data for selected peptide.</p>
                            <small>Log an injection with the name "{selectedPeptide}" to see the graph.</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HalfLifePlotter;
