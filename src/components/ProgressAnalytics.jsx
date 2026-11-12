import DoseProgress from './DoseProgress';
import React, { useState, useEffect, useMemo } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { TrendingUp, Activity, Calendar, Target, ChevronDown } from 'lucide-react';
import { useInjections } from '../hooks/useInjections';
import { useTheme } from '../context/ThemeContext';
import styles from './ProgressAnalytics.module.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ProgressAnalytics = () => {
    const { injections } = useInjections();
    const { theme } = useTheme();
    const [timeRange, setTimeRange] = useState('30'); // days
    const [showRangeDropdown, setShowRangeDropdown] = useState(false);

    const isDark = theme === 'dark';

    // Chart colors
    const colors = {
        primary: '#3b82f6',
        secondary: '#06b6d4',
        accent: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        text: isDark ? '#e2e8f0' : '#1f2937',
        textMuted: isDark ? '#94a3b8' : '#6b7280',
        grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)'
    };

    // Filter injections by time range
    const filteredInjections = useMemo(() => {
        const cutoff = subDays(new Date(), parseInt(timeRange));
        return injections.filter(inj => {
            const date = new Date(inj.injection_date || inj.date);
            return date >= cutoff && date <= new Date();
        });
    }, [injections, timeRange]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = filteredInjections.length;
        const uniquePeptides = [...new Set(filteredInjections.map(i => i.peptide_name || i.peptide))];
        const avgPerWeek = total / (parseInt(timeRange) / 7);

        // Most used peptide
        const peptideCounts = {};
        filteredInjections.forEach(i => {
            const name = i.peptide_name || i.peptide;
            peptideCounts[name] = (peptideCounts[name] || 0) + 1;
        });
        const mostUsed = Object.entries(peptideCounts).sort((a, b) => b[1] - a[1])[0];

        return {
            total,
            uniquePeptides: uniquePeptides.length,
            avgPerWeek: avgPerWeek.toFixed(1),
            mostUsed: mostUsed ? mostUsed[0] : 'N/A'
        };
    }, [filteredInjections, timeRange]);

    // Injection trend data (daily)
    const trendData = useMemo(() => {
        const days = parseInt(timeRange);
        const labels = [];
        const data = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateStr = format(date, 'yyyy-MM-dd');
            labels.push(format(date, days > 14 ? 'MMM d' : 'EEE'));

            const count = filteredInjections.filter(inj => {
                const injDate = format(new Date(inj.injection_date || inj.date), 'yyyy-MM-dd');
                return injDate === dateStr;
            }).length;
            data.push(count);
        }

        return {
            labels,
            datasets: [{
                label: 'Injections',
                data,
                fill: true,
                borderColor: colors.primary,
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                tension: 0.4,
                pointRadius: days > 14 ? 0 : 4,
                pointHoverRadius: 6,
                pointBackgroundColor: colors.primary
            }]
        };
    }, [filteredInjections, timeRange, colors]);

    // Peptide distribution data
    const distributionData = useMemo(() => {
        const peptideCounts = {};
        filteredInjections.forEach(i => {
            const name = i.peptide_name || i.peptide;
            peptideCounts[name] = (peptideCounts[name] || 0) + 1;
        });

        const sorted = Object.entries(peptideCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        const colorPalette = [
            colors.primary,
            colors.secondary,
            colors.accent,
            colors.success,
            colors.warning,
            '#ec4899'
        ];

        return {
            labels: sorted.map(([name]) => name),
            datasets: [{
                data: sorted.map(([, count]) => count),
                backgroundColor: colorPalette.slice(0, sorted.length),
                borderWidth: 0,
                hoverOffset: 8
            }]
        };
    }, [filteredInjections, colors]);

    // Weekly comparison data
    const weeklyData = useMemo(() => {
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
            const weekStart = startOfWeek(subDays(new Date(), i * 7));
            const weekEnd = endOfWeek(subDays(new Date(), i * 7));
            const label = format(weekStart, 'MMM d');

            const count = filteredInjections.filter(inj => {
                const date = new Date(inj.injection_date || inj.date);
                return date >= weekStart && date <= weekEnd;
            }).length;

            weeks.push({ label, count });
        }

        return {
            labels: weeks.map(w => w.label),
            datasets: [{
                label: 'Weekly Injections',
                data: weeks.map(w => w.count),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(59, 130, 246, 1)'
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        };
    }, [filteredInjections]);

    // Chart options
    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? '#1a1f35' : '#fff',
                titleColor: colors.text,
                bodyColor: colors.textMuted,
                borderColor: colors.grid,
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: colors.textMuted, maxTicksLimit: 7 }
            },
            y: {
                beginAtZero: true,
                grid: { color: colors.grid },
                ticks: { color: colors.textMuted, stepSize: 1 }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: colors.textMuted,
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        }
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: colors.textMuted }
            },
            y: {
                beginAtZero: true,
                grid: { color: colors.grid },
                ticks: { color: colors.textMuted, stepSize: 1 }
            }
        }
    };

    const timeRanges = [
        { value: '7', label: 'Last 7 Days' },
        { value: '14', label: 'Last 14 Days' },
        { value: '30', label: 'Last 30 Days' },
        { value: '90', label: 'Last 90 Days' }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    <TrendingUp size={24} />
                    Progress Analytics
                </h2>
                <div className={styles.rangeSelector}>
                    <button
                        className={styles.rangeButton}
                        onClick={() => setShowRangeDropdown(!showRangeDropdown)}
                    >
                        {timeRanges.find(r => r.value === timeRange)?.label}
                        <ChevronDown size={16} />
                    </button>
                    {showRangeDropdown && (
                        <div className={styles.dropdown}>
                            {timeRanges.map(range => (
                                <button
                                    key={range.value}
                                    className={`${styles.dropdownItem} ${timeRange === range.value ? styles.active : ''}`}
                                    onClick={() => {
                                        setTimeRange(range.value);
                                        setShowRangeDropdown(false);
                                    }}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: colors.primary }}>
                        <Activity size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Injections</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(6, 182, 212, 0.15)', color: colors.secondary }}>
                        <Target size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.uniquePeptides}</span>
                        <span className={styles.statLabel}>Peptides Used</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.15)', color: colors.accent }}>
                        <Calendar size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.avgPerWeek}</span>
                        <span className={styles.statLabel}>Avg/Week</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: colors.success }}>
                        <TrendingUp size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue} title={stats.mostUsed}>{stats.mostUsed.substring(0, 12)}</span>
                        <span className={styles.statLabel}>Most Used</span>
                    </div>
                </div>
            </div>

            <DoseProgress injections={injections} days={timeRange} />
            {/* Charts */}
            <div className={styles.chartsGrid}>
                {/* Trend Chart */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Injection Trend</h3>
                    <div className={styles.chartContainer}>
                        <Line data={trendData} options={lineOptions} />
                    </div>
                </div>

                {/* Distribution Chart */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Peptide Distribution</h3>
                    <div className={styles.chartContainer}>
                        {distributionData.labels.length > 0 ? (
                            <Doughnut data={distributionData} options={doughnutOptions} />
                        ) : (
                            <div className={styles.noData}>No data available</div>
                        )}
                    </div>
                </div>

                {/* Weekly Comparison */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Weekly Comparison</h3>
                    <div className={styles.chartContainer}>
                        <Bar data={weeklyData} options={barOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressAnalytics;
