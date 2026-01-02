import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    ChevronLeft, ChevronRight, Plus, Trash2, Calendar, Syringe, X, Clock,
    TrendingUp, Activity, Edit2, Check, ChevronDown, AlertCircle, CheckCircle,
    Circle, Repeat, Zap, CalendarPlus, Settings, MoreHorizontal, CloudOff, Loader2
} from 'lucide-react';
import { useInjections } from '../hooks/useInjections';
import { useSchedule } from '../hooks/useSchedule';
import { usePeptides } from '../hooks/usePeptides';
import styles from './InjectionLog.module.css';

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sun', short: 'S' },
    { value: 1, label: 'Mon', short: 'M' },
    { value: 2, label: 'Tue', short: 'T' },
    { value: 3, label: 'Wed', short: 'W' },
    { value: 4, label: 'Thu', short: 'T' },
    { value: 5, label: 'Fri', short: 'F' },
    { value: 6, label: 'Sat', short: 'S' }
];

const QUICK_PROTOCOLS = [
    { id: 'daily', label: 'Every Day', days: [0, 1, 2, 3, 4, 5, 6], icon: '📅' },
    { id: 'eod', label: 'Every Other Day', days: [1, 3, 5], icon: '🔄' },
    { id: 'mwf', label: 'Mon/Wed/Fri', days: [1, 3, 5], icon: '💪' },
    { id: 'weekdays', label: 'Weekdays', days: [1, 2, 3, 4, 5], icon: '📆' },
    { id: 'weekends', label: 'Weekends', days: [0, 6], icon: '🌴' },
    { id: 'once', label: 'Once Weekly', days: [], icon: '1️⃣' }
];

const InjectionLog = () => {
    // Hooks
    const {
        injections, loading: injectionsLoading, error: injectionsError,
        addInjection, updateInjection, deleteInjection, getStats, isUsingLocalStorage
    } = useInjections();

    const { peptides } = usePeptides();

    const {
        schedules, templates, loading: schedulesLoading,
        addSchedule, createRecurringSchedule, deleteSchedule, toggleComplete,
        deleteTemplate, getUpcomingSchedules
    } = useSchedule();

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeView, setActiveView] = useState('calendar'); // 'calendar', 'schedule'
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState('log'); // 'log', 'schedule', 'recurring'
    const [editingId, setEditingId] = useState(null);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const autocompleteRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        peptide: '',
        dosage: '',
        unit: 'mg',
        site: 'Abdomen',
        time: '08:00',
        notes: '',
        date: new Date().toISOString().slice(0, 16),
        recurrenceDays: [],
        duration: 28
    });

    const loading = injectionsLoading || schedulesLoading;
    const stats = useMemo(() => getStats(), [getStats]);

    // Calendar helpers
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Previous month padding
        for (let i = 0; i < firstDay.getDay(); i++) {
            const d = new Date(year, month, -i);
            days.unshift({ date: d, dimmed: true });
        }

        // Current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), dimmed: false });
        }

        // Next month padding
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), dimmed: true });
        }

        return days;
    }, [year, month]);

    // Get data for a specific day
    const getDataForDay = useCallback((day) => {
        const dayString = day.toDateString();

        const dayInjections = injections.filter(inj => {
            const injDate = new Date(inj.date);
            return injDate.toDateString() === dayString;
        });

        const daySchedules = schedules.filter(sch => {
            const schDate = new Date(sch.date);
            return schDate.toDateString() === dayString;
        });

        return { injections: dayInjections, schedules: daySchedules };
    }, [injections, schedules]);

    // Filter for autocomplete
    const filteredPeptides = useMemo(() => {
        if (!formData.peptide) return peptides.map(p => p.name).slice(0, 8);
        const search = formData.peptide.toLowerCase();
        return peptides
            .filter(p => p.name.toLowerCase().includes(search))
            .map(p => p.name)
            .slice(0, 8);
    }, [formData.peptide, peptides]);

    // Click outside for autocomplete
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
                setShowAutocomplete(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Navigation
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    const handleDateClick = (day) => {
        setSelectedDate(day.date);
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    const isPast = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    // Form handlers
    const resetForm = () => {
        setFormData({
            peptide: '',
            dosage: '',
            unit: 'mg',
            site: 'Abdomen',
            time: '08:00',
            notes: '',
            date: selectedDate.toISOString().slice(0, 16),
            recurrenceDays: [],
            duration: 28
        });
        setEditingId(null);
        setFormMode('log');
    };

    const openLogForm = (prefill = null) => {
        resetForm();
        if (prefill) {
            setFormData(prev => ({
                ...prev,
                peptide: prefill.peptide,
                dosage: prefill.dosage?.toString() || '',
                unit: prefill.unit || 'mg',
                date: new Date().toISOString().slice(0, 16)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                date: selectedDate.toISOString().slice(0, 16)
            }));
        }
        setFormMode('log');
        setShowForm(true);
    };

    const openScheduleForm = () => {
        resetForm();
        setFormMode('schedule');
        setShowForm(true);
    };

    const openRecurringForm = () => {
        resetForm();
        setFormMode('recurring');
        setShowForm(true);
        // Switch to calendar view so the form is visible
        setActiveView('calendar');
    };

    const toggleRecurrenceDay = (dayValue) => {
        setFormData(prev => ({
            ...prev,
            recurrenceDays: prev.recurrenceDays.includes(dayValue)
                ? prev.recurrenceDays.filter(d => d !== dayValue)
                : [...prev.recurrenceDays, dayValue].sort()
        }));
    };

    const applyQuickProtocol = (protocol) => {
        setFormData(prev => ({
            ...prev,
            recurrenceDays: protocol.days
        }));
    };

    const selectPeptide = (name) => {
        setFormData(prev => ({ ...prev, peptide: name }));
        setShowAutocomplete(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.peptide || !formData.dosage) return;

        if (formMode === 'log') {
            // Add as logged injection
            const injectionData = {
                peptide: formData.peptide,
                dosage: parseFloat(formData.dosage),
                unit: formData.unit,
                site: formData.site,
                notes: formData.notes || '',
                date: new Date(formData.date).toISOString()
            };

            if (editingId) {
                await updateInjection(editingId, injectionData);
            } else {
                await addInjection(injectionData);
            }
        } else if (formMode === 'schedule') {
            // Add as scheduled item
            await addSchedule({
                date: selectedDate.toISOString(),
                peptide: formData.peptide,
                dosage: parseFloat(formData.dosage),
                unit: formData.unit,
                time: formData.time,
                notes: formData.notes
            });
        } else if (formMode === 'recurring') {
            // Create recurring schedule
            if (formData.recurrenceDays.length === 0) {
                return;
            }

            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + formData.duration);
            endDate.setHours(23, 59, 59, 999);

            await createRecurringSchedule({
                peptide: formData.peptide,
                dosage: parseFloat(formData.dosage),
                unit: formData.unit,
                time: formData.time,
                recurrenceDays: formData.recurrenceDays,
                notes: formData.notes
            }, startDate, endDate);
        }

        resetForm();
        setShowForm(false);
    };

    // Complete schedule (converts to injection)
    const handleCompleteSchedule = async (schedule) => {
        // First toggle the schedule as complete
        await toggleComplete(schedule.id);

        // Then log it as an injection
        await addInjection({
            peptide: schedule.peptide,
            dosage: schedule.dosage,
            unit: schedule.unit,
            site: 'Abdomen',
            notes: `Completed from schedule`,
            date: new Date().toISOString()
        });
    };

    const handleEditInjection = (injection) => {
        setFormData({
            peptide: injection.peptide,
            dosage: injection.dosage.toString(),
            unit: injection.unit,
            site: injection.site || 'Abdomen',
            time: '08:00',
            notes: injection.notes || '',
            date: new Date(injection.date).toISOString().slice(0, 16),
            recurrenceDays: [],
            duration: 28
        });
        setEditingId(injection.id);
        setFormMode('log');
        setShowForm(true);
    };

    const handleDeleteInjection = async (id) => {
        if (confirmDelete === id) {
            await deleteInjection(id);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
            setTimeout(() => setConfirmDelete(null), 3000);
        }
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

    // Get selected day data
    const selectedDayData = useMemo(() => getDataForDay(selectedDate), [selectedDate, getDataForDay]);
    const upcomingSchedules = useMemo(() => getUpcomingSchedules(7), [getUpcomingSchedules]);

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <Loader2 size={32} className={styles.spinner} />
                <p>Loading your injection log...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <Syringe size={28} className={styles.headerIcon} />
                    <div>
                        <h1>Injection Log</h1>
                        <p>Track & schedule your peptide protocol</p>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    {isUsingLocalStorage && (
                        <span className={styles.guestBadge}>
                            <CloudOff size={14} />
                            Guest Mode
                        </span>
                    )}
                </div>
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

            {/* View Tabs */}
            <div className={styles.viewTabs}>
                <button
                    className={`${styles.viewTab} ${activeView === 'calendar' ? styles.activeTab : ''}`}
                    onClick={() => setActiveView('calendar')}
                >
                    <Calendar size={18} />
                    Calendar
                </button>
                <button
                    className={`${styles.viewTab} ${activeView === 'schedule' ? styles.activeTab : ''}`}
                    onClick={() => setActiveView('schedule')}
                >
                    <Repeat size={18} />
                    Upcoming
                    {upcomingSchedules.length > 0 && (
                        <span className={styles.badge}>{upcomingSchedules.length}</span>
                    )}
                </button>
            </div>

            {/* Error Message */}
            {injectionsError && (
                <div className={styles.errorBanner}>
                    <AlertCircle size={16} />
                    {injectionsError}
                </div>
            )}

            {activeView === 'calendar' ? (
                <>
                    {/* Calendar */}
                    <div className={`card glass-panel ${styles.calendarCard}`}>
                        <div className={styles.calendarHeader}>
                            <button className={styles.navBtn} onClick={prevMonth}>
                                <ChevronLeft size={20} />
                            </button>
                            <div className={styles.monthDisplay}>
                                <h2>{currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
                                <button className={styles.todayBtn} onClick={goToToday}>Today</button>
                            </div>
                            <button className={styles.navBtn} onClick={nextMonth}>
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className={styles.grid}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className={styles.dayHeader}>{d}</div>
                            ))}

                            {daysInMonth.map((day, i) => {
                                const dayData = getDataForDay(day.date);
                                const hasInjections = dayData.injections.length > 0;
                                const hasSchedules = dayData.schedules.length > 0;
                                const completedSchedules = dayData.schedules.filter(s => s.completed).length;
                                const pendingSchedules = dayData.schedules.filter(s => !s.completed).length;

                                return (
                                    <button
                                        key={i}
                                        className={`${styles.day} ${day.dimmed ? styles.dimmed : ''} ${isToday(day.date) ? styles.today : ''} ${isSelected(day.date) ? styles.selected : ''}`}
                                        onClick={() => handleDateClick(day)}
                                    >
                                        <span className={styles.dayNumber}>{day.date.getDate()}</span>
                                        <div className={styles.dots}>
                                            {/* Show dots for injections (green) */}
                                            {hasInjections && dayData.injections.slice(0, 2).map((_, idx) => (
                                                <span key={`inj-${idx}`} className={`${styles.dot} ${styles.injectionDot}`} />
                                            ))}
                                            {/* Show dots for pending schedules (cyan) */}
                                            {pendingSchedules > 0 && (
                                                <span className={`${styles.dot} ${styles.scheduleDot}`} />
                                            )}
                                            {/* Show dots for completed schedules (green with check pattern) */}
                                            {completedSchedules > 0 && (
                                                <span className={`${styles.dot} ${styles.completedDot}`} />
                                            )}
                                            {(dayData.injections.length + dayData.schedules.length) > 3 && (
                                                <span className={styles.moreCount}>
                                                    +{dayData.injections.length + dayData.schedules.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Day Details */}
                    <div className={`card glass-panel ${styles.detailsSection}`}>
                        <div className={styles.detailsHeader}>
                            <div>
                                <h3>{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                                {isToday(selectedDate) && <span className={styles.todayLabel}>Today</span>}
                            </div>
                            <div className={styles.actionButtons}>
                                <button
                                    className={`${styles.addBtn} ${styles.addBtnPrimary}`}
                                    onClick={() => openLogForm()}
                                >
                                    <Plus size={18} />
                                    Log Shot
                                </button>
                                {!isPast(selectedDate) && (
                                    <button
                                        className={`${styles.addBtn} ${styles.addBtnSecondary}`}
                                        onClick={openScheduleForm}
                                    >
                                        <CalendarPlus size={18} />
                                    </button>
                                )}
                                <button
                                    className={`${styles.addBtn} ${styles.addBtnTertiary}`}
                                    onClick={openRecurringForm}
                                >
                                    <Repeat size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        {showForm && (
                            <form className={styles.form} onSubmit={handleSubmit}>
                                <div className={styles.formHeader}>
                                    <h4>
                                        {formMode === 'log' && (editingId ? 'Edit Injection' : 'Log Injection')}
                                        {formMode === 'schedule' && 'Schedule Injection'}
                                        {formMode === 'recurring' && 'Create Recurring Schedule'}
                                    </h4>
                                    <button type="button" className={styles.closeBtn} onClick={() => setShowForm(false)}>
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Peptide Name */}
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
                                                        {name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Dosage Row */}
                                <div className={styles.formRow}>
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
                                    {(formMode === 'schedule' || formMode === 'recurring') && (
                                        <div className={styles.inputGroup}>
                                            <label>Time</label>
                                            <input
                                                type="time"
                                                value={formData.time}
                                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Log-specific: Date & Site */}
                                {formMode === 'log' && (
                                    <>
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
                                    </>
                                )}

                                {/* Recurring-specific: Days Selector */}
                                {formMode === 'recurring' && (
                                    <div className={styles.formSection}>
                                        <label>Quick Protocols</label>
                                        <div className={styles.quickProtocols}>
                                            {QUICK_PROTOCOLS.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    className={`${styles.quickProtocolBtn} ${JSON.stringify(formData.recurrenceDays) === JSON.stringify(p.days) ? styles.quickProtocolActive : ''}`}
                                                    onClick={() => applyQuickProtocol(p)}
                                                >
                                                    <span className={styles.protocolEmoji}>{p.icon}</span>
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>

                                        <label style={{ marginTop: '1rem' }}>Or select specific days</label>
                                        <div className={styles.daysSelector}>
                                            {DAYS_OF_WEEK.map(day => (
                                                <button
                                                    key={day.value}
                                                    type="button"
                                                    className={`${styles.dayBtn} ${formData.recurrenceDays.includes(day.value) ? styles.dayBtnActive : ''}`}
                                                    onClick={() => toggleRecurrenceDay(day.value)}
                                                >
                                                    <span className={styles.dayShort}>{day.short}</span>
                                                    <span className={styles.dayLabel}>{day.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className={styles.inputGroup}>
                                            <label>Duration (days)</label>
                                            <select
                                                value={formData.duration}
                                                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                            >
                                                <option value={7}>1 Week</option>
                                                <option value={14}>2 Weeks</option>
                                                <option value={28}>4 Weeks</option>
                                                <option value={56}>8 Weeks</option>
                                                <option value={84}>12 Weeks</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div className={styles.inputGroup}>
                                    <label>Notes (optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Optional notes..."
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className={styles.submitBtn}>
                                    {formMode === 'log' && (editingId ? <><Check size={18} /> Update</> : <><Plus size={18} /> Log Injection</>)}
                                    {formMode === 'schedule' && <><CalendarPlus size={18} /> Add to Schedule</>}
                                    {formMode === 'recurring' && <><Repeat size={18} /> Create Protocol</>}
                                </button>
                            </form>
                        )}

                        {/* Day Items */}
                        <div className={styles.dayItems}>
                            {/* Pending Scheduled Items */}
                            {selectedDayData.schedules.filter(s => !s.completed).length > 0 && (
                                <div className={styles.itemSection}>
                                    <h5 className={styles.sectionLabel}>
                                        <Clock size={14} />
                                        Scheduled
                                    </h5>
                                    {selectedDayData.schedules.filter(s => !s.completed).map(schedule => (
                                        <div key={schedule.id} className={styles.scheduleItem}>
                                            <button
                                                className={styles.completeBtn}
                                                onClick={() => handleCompleteSchedule(schedule)}
                                                title="Mark as complete (will log injection)"
                                            >
                                                <Circle size={22} />
                                            </button>
                                            <div className={styles.itemInfo}>
                                                <span className={styles.itemPeptide}>{schedule.peptide}</span>
                                                <span className={styles.itemDetails}>
                                                    {schedule.dosage}{schedule.unit} · {schedule.time}
                                                    {schedule.isRecurring && <Repeat size={12} className={styles.recurringIcon} />}
                                                </span>
                                            </div>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => deleteSchedule(schedule.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Logged Injections */}
                            {selectedDayData.injections.length > 0 && (
                                <div className={styles.itemSection}>
                                    <h5 className={styles.sectionLabel}>
                                        <CheckCircle size={14} />
                                        Logged
                                    </h5>
                                    {selectedDayData.injections.map(injection => (
                                        <div key={injection.id} className={styles.injectionItem}>
                                            <div className={styles.completedIcon}>
                                                <CheckCircle size={22} />
                                            </div>
                                            <div className={styles.itemInfo}>
                                                <span className={styles.itemPeptide}>{injection.peptide}</span>
                                                <span className={styles.itemDetails}>
                                                    {injection.dosage}{injection.unit} · {injection.site} · {formatTime(injection.date)}
                                                </span>
                                                {injection.notes && (
                                                    <span className={styles.itemNotes}>{injection.notes}</span>
                                                )}
                                            </div>
                                            <div className={styles.itemActions}>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => handleEditInjection(injection)}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className={`${styles.deleteBtn} ${confirmDelete === injection.id ? styles.confirmDelete : ''}`}
                                                    onClick={() => handleDeleteInjection(injection.id)}
                                                >
                                                    {confirmDelete === injection.id ? <Check size={16} /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Completed Schedules */}
                            {selectedDayData.schedules.filter(s => s.completed).length > 0 && (
                                <div className={styles.itemSection}>
                                    <h5 className={styles.sectionLabel} style={{ opacity: 0.6 }}>
                                        <Check size={14} />
                                        Completed Schedule
                                    </h5>
                                    {selectedDayData.schedules.filter(s => s.completed).map(schedule => (
                                        <div key={schedule.id} className={`${styles.scheduleItem} ${styles.completedSchedule}`}>
                                            <div className={styles.completedIcon}>
                                                <CheckCircle size={22} />
                                            </div>
                                            <div className={styles.itemInfo}>
                                                <span className={styles.itemPeptide}>{schedule.peptide}</span>
                                                <span className={styles.itemDetails}>
                                                    {schedule.dosage}{schedule.unit} · {schedule.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {selectedDayData.injections.length === 0 && selectedDayData.schedules.length === 0 && (
                                <div className={styles.emptyState}>
                                    <Syringe size={40} className={styles.emptyIcon} />
                                    <p>No injections for this day</p>
                                    <span>Tap "Log Shot" to add one</span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                /* Upcoming Schedule View */
                <div className={`card glass-panel ${styles.upcomingSection}`}>
                    <div className={styles.upcomingHeader}>
                        <h3>
                            <Repeat size={20} />
                            Upcoming Schedule
                        </h3>
                        <button className={styles.addBtn} onClick={openRecurringForm}>
                            <Plus size={18} />
                            New Protocol
                        </button>
                    </div>

                    {upcomingSchedules.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Calendar size={40} className={styles.emptyIcon} />
                            <p>No upcoming schedules</p>
                            <span>Create a recurring protocol to get started</span>
                        </div>
                    ) : (
                        <div className={styles.upcomingList}>
                            {upcomingSchedules.map(schedule => {
                                const schedDate = new Date(schedule.date);
                                const isScheduleToday = isToday(schedDate);

                                return (
                                    <div
                                        key={schedule.id}
                                        className={`${styles.upcomingItem} ${schedule.completed ? styles.completedItem : ''} ${isScheduleToday ? styles.todayItem : ''}`}
                                    >
                                        <div className={styles.upcomingDate}>
                                            <span className={styles.upcomingDay}>{schedDate.getDate()}</span>
                                            <span className={styles.upcomingMonth}>{schedDate.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                        </div>
                                        <div className={styles.upcomingInfo}>
                                            <span className={styles.upcomingPeptide}>{schedule.peptide}</span>
                                            <span className={styles.upcomingDetails}>
                                                {schedule.dosage}{schedule.unit} · {schedule.time}
                                                {schedule.isRecurring && <Repeat size={12} className={styles.recurringIcon} />}
                                            </span>
                                        </div>
                                        {!schedule.completed && isScheduleToday && (
                                            <button
                                                className={styles.quickCompleteBtn}
                                                onClick={() => handleCompleteSchedule(schedule)}
                                            >
                                                <Check size={18} />
                                                Log Now
                                            </button>
                                        )}
                                        {schedule.completed && (
                                            <span className={styles.completedBadge}>
                                                <CheckCircle size={16} />
                                                Done
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Active Templates */}
                    {templates.length > 0 && (
                        <div className={styles.templatesSection}>
                            <h4>
                                <Zap size={16} />
                                Active Protocols
                            </h4>
                            <div className={styles.templatesList}>
                                {templates.map(template => (
                                    <div key={template.id} className={styles.templateItem}>
                                        <div className={styles.templateInfo}>
                                            <span className={styles.templateName}>{template.name || template.peptide}</span>
                                            <span className={styles.templateDetails}>
                                                {template.dosage}{template.unit} · {template.recurrenceDays?.map(d => DAYS_OF_WEEK[d]?.short).join(', ')}
                                            </span>
                                        </div>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => deleteTemplate(template.id, true)}
                                            title="Delete protocol and all scheduled items"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InjectionLog;
