import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle, Circle, Calendar, X,
    CloudOff, Loader2, Repeat, Clock, Zap, Edit2, CalendarPlus, CalendarCheck,
    AlertCircle
} from 'lucide-react';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
    isSameMonth, isSameDay, addMonths, subMonths, isToday, addDays, addWeeks
} from 'date-fns';
import { useSchedule } from '../hooks/useSchedule';
import { useAuth } from '../context/AuthContext';
import { PEPTIDE_DATABASE } from '../data/peptideDatabase';
import styles from './CalendarScheduler.module.css';

const PEPTIDE_NAMES = Object.keys(PEPTIDE_DATABASE);

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
    { id: 'tts', label: 'Tue/Thu/Sat', days: [2, 4, 6], icon: '⚡' },
    { id: 'weekdays', label: 'Weekdays', days: [1, 2, 3, 4, 5], icon: '📆' },
    { id: 'weekends', label: 'Weekends', days: [0, 6], icon: '🌴' },
    { id: 'once', label: 'Once Weekly', days: [], icon: '1️⃣' },
    { id: 'twice', label: 'Twice Weekly', days: [], icon: '2️⃣' }
];

const CalendarScheduler = () => {
    const {
        schedules, templates, loading, addSchedule, createRecurringSchedule,
        deleteSchedule, toggleComplete, deleteTemplate, getUpcomingSchedules
    } = useSchedule();
    const { user } = useAuth();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState('calendar'); // 'calendar', 'protocols', 'upcoming'
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('single'); // 'single', 'recurring'
    const [formData, setFormData] = useState({
        peptide: '',
        dosage: '',
        unit: 'mg',
        time: '08:00',
        notes: '',
        name: '',
        recurrenceDays: [],
        weeks: 4
    });

    // Autocomplete state
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [filteredPeptides, setFilteredPeptides] = useState([]);
    const autocompleteRef = useRef(null);

    // Filter peptides for autocomplete
    useEffect(() => {
        if (formData.peptide) {
            const search = formData.peptide.toLowerCase();
            const filtered = PEPTIDE_NAMES.filter(name =>
                name.toLowerCase().includes(search)
            ).slice(0, 6);
            setFilteredPeptides(filtered);
        } else {
            setFilteredPeptides(PEPTIDE_NAMES.slice(0, 6));
        }
    }, [formData.peptide]);

    // Close autocomplete on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
                setShowAutocomplete(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const calendarDays = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth))
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(today);
    };

    const handleDateClick = (day) => {
        setSelectedDate(day);
        setIsFormOpen(false);
    };

    const selectPeptide = (name) => {
        setFormData({ ...formData, peptide: name });
        setShowAutocomplete(false);
    };

    const toggleDay = (dayValue) => {
        const days = formData.recurrenceDays.includes(dayValue)
            ? formData.recurrenceDays.filter(d => d !== dayValue)
            : [...formData.recurrenceDays, dayValue].sort((a, b) => a - b);
        setFormData({ ...formData, recurrenceDays: days });
    };

    const applyQuickProtocol = (protocol) => {
        if (protocol.id === 'once' || protocol.id === 'twice') {
            // For these, let user pick specific days
            setFormData({ ...formData, recurrenceDays: [] });
        } else {
            setFormData({ ...formData, recurrenceDays: protocol.days });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.peptide || !formData.dosage) return;

        if (formMode === 'single') {
            addSchedule({
                date: selectedDate.toISOString(),
                peptide: formData.peptide,
                dosage: parseFloat(formData.dosage),
                unit: formData.unit,
                time: formData.time,
                notes: formData.notes || null
            });
        } else {
            // Recurring schedule
            if (formData.recurrenceDays.length === 0) {
                alert('Please select at least one day of the week');
                return;
            }

            const startDate = new Date();
            const endDate = addWeeks(startDate, formData.weeks);

            await createRecurringSchedule({
                name: formData.name || `${formData.peptide} Protocol`,
                peptide: formData.peptide,
                dosage: parseFloat(formData.dosage),
                unit: formData.unit,
                time: formData.time,
                recurrenceDays: formData.recurrenceDays,
                notes: formData.notes || null
            }, startDate, endDate);
        }

        setFormData({
            peptide: '', dosage: '', unit: 'mg', time: '08:00',
            notes: '', name: '', recurrenceDays: [], weeks: 4
        });
        setIsFormOpen(false);
    };

    const getScheduleDate = (schedule) => {
        try {
            const date = new Date(schedule.date);
            if (isNaN(date.getTime())) return null;
            return date;
        } catch {
            return null;
        }
    };

    const selectedDaySchedules = schedules.filter(s => {
        const scheduleDate = getScheduleDate(s);
        return scheduleDate && isSameDay(scheduleDate, selectedDate);
    });

    const getSchedulesForDay = (day) => {
        return schedules.filter(s => {
            const scheduleDate = getScheduleDate(s);
            return scheduleDate && isSameDay(scheduleDate, day);
        });
    };

    const upcomingSchedules = getUpcomingSchedules(7);

    const getDaysLabel = (days) => {
        if (days.length === 7) return 'Every day';
        if (days.length === 0) return 'No days selected';
        return days.map(d => DAYS_OF_WEEK.find(dow => dow.value === d)?.label).join(', ');
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>
                    <Loader2 size={32} className={styles.spinner} />
                    <p>Loading schedule...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <Calendar size={28} className={styles.headerIcon} />
                    <div>
                        <h1>Injection Schedule</h1>
                        <p>Plan and track your peptide protocols</p>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    {!user && (
                        <div className={styles.guestBadge}>
                            <CloudOff size={14} />
                            Guest Mode
                        </div>
                    )}
                </div>
            </div>

            {/* View Tabs */}
            <div className={styles.viewTabs}>
                <button
                    className={`${styles.viewTab} ${view === 'calendar' ? styles.activeTab : ''}`}
                    onClick={() => setView('calendar')}
                >
                    <Calendar size={16} />
                    Calendar
                </button>
                <button
                    className={`${styles.viewTab} ${view === 'protocols' ? styles.activeTab : ''}`}
                    onClick={() => setView('protocols')}
                >
                    <Repeat size={16} />
                    Protocols
                    {templates.length > 0 && <span className={styles.badge}>{templates.length}</span>}
                </button>
                <button
                    className={`${styles.viewTab} ${view === 'upcoming' ? styles.activeTab : ''}`}
                    onClick={() => setView('upcoming')}
                >
                    <Clock size={16} />
                    Upcoming
                    {upcomingSchedules.length > 0 && <span className={styles.badge}>{upcomingSchedules.length}</span>}
                </button>
            </div>

            {/* Calendar View */}
            {view === 'calendar' && (
                <>
                    <div className={`card glass-panel ${styles.calendarCard}`}>
                        <div className={styles.calendarHeader}>
                            <button onClick={prevMonth} className={styles.navBtn} aria-label="Previous month">
                                <ChevronLeft size={20} />
                            </button>
                            <div className={styles.monthDisplay}>
                                <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
                                <button onClick={goToToday} className={styles.todayBtn}>
                                    Today
                                </button>
                            </div>
                            <button onClick={nextMonth} className={styles.navBtn} aria-label="Next month">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className={styles.grid}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className={styles.dayHeader}>{day}</div>
                            ))}
                            {calendarDays.map(day => {
                                const daySchedules = getSchedulesForDay(day);
                                const hasSchedules = daySchedules.length > 0;
                                const completedCount = daySchedules.filter(s => s.completed).length;
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isTodayDate = isToday(day);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        className={`${styles.day} ${!isCurrentMonth ? styles.dimmed : ''} ${isSelected ? styles.selected : ''} ${isTodayDate ? styles.today : ''}`}
                                        onClick={() => handleDateClick(day)}
                                    >
                                        <span className={styles.dayNumber}>{format(day, 'd')}</span>
                                        {hasSchedules && (
                                            <div className={styles.dots}>
                                                {daySchedules.slice(0, 3).map((s, idx) => (
                                                    <div
                                                        key={s.id || idx}
                                                        className={`${styles.dot} ${s.completed ? styles.completedDot : ''}`}
                                                    />
                                                ))}
                                                {daySchedules.length > 3 && (
                                                    <span className={styles.moreCount}>+{daySchedules.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className={`card glass-panel ${styles.detailsSection}`}>
                        <div className={styles.detailsHeader}>
                            <div>
                                <h3>{format(selectedDate, 'EEEE')}</h3>
                                <p className={styles.dateSubtitle}>{format(selectedDate, 'MMMM d, yyyy')}</p>
                            </div>
                            <div className={styles.headerActions}>
                                <button
                                    className={`${styles.addBtn} ${styles.addBtnRecurring}`}
                                    onClick={() => { setFormMode('recurring'); setIsFormOpen(true); setView('protocols'); }}
                                >
                                    <Repeat size={16} />
                                    New Protocol
                                </button>
                                <button
                                    className={`${styles.addBtn} ${isFormOpen && formMode === 'single' ? styles.addBtnActive : ''}`}
                                    onClick={() => { setFormMode('single'); setIsFormOpen(!isFormOpen); }}
                                >
                                    {isFormOpen && formMode === 'single' ? <X size={18} /> : <Plus size={18} />}
                                    {isFormOpen && formMode === 'single' ? 'Cancel' : 'Add Dose'}
                                </button>
                            </div>
                        </div>

                        {/* Single Dose Form */}
                        {isFormOpen && formMode === 'single' && (
                            <form className={styles.form} onSubmit={handleSubmit}>
                                <div className={styles.inputGroup} ref={autocompleteRef}>
                                    <label>Peptide</label>
                                    <div className={styles.autocompleteWrapper}>
                                        <input
                                            type="text"
                                            value={formData.peptide}
                                            onChange={e => setFormData({ ...formData, peptide: e.target.value })}
                                            onFocus={() => setShowAutocomplete(true)}
                                            placeholder="Search peptide..."
                                            autoComplete="off"
                                            required
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

                                <div className={styles.formRow}>
                                    <div className={styles.inputGroup}>
                                        <label>Dosage</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.dosage}
                                            onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                                            placeholder="0.5"
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
                                            <option value="IU">IU</option>
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Time</label>
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Notes (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="e.g., Take with food"
                                    />
                                </div>

                                <button type="submit" className={styles.submitBtn}>
                                    <Plus size={18} />
                                    Add to Schedule
                                </button>
                            </form>
                        )}

                        {/* Schedule List */}
                        <div className={styles.scheduleList}>
                            {selectedDaySchedules.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Calendar size={40} className={styles.emptyIcon} />
                                    <p>No doses scheduled</p>
                                    <span>Add a single dose or create a recurring protocol</span>
                                </div>
                            ) : (
                                selectedDaySchedules.map(schedule => (
                                    <div
                                        key={schedule.id}
                                        className={`${styles.scheduleItem} ${schedule.completed ? styles.completedItem : ''}`}
                                    >
                                        <button
                                            className={styles.scheduleToggle}
                                            onClick={() => toggleComplete(schedule.id)}
                                            aria-label={schedule.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                        >
                                            {schedule.completed ?
                                                <CheckCircle className={styles.checkIcon} size={24} /> :
                                                <Circle className={styles.circleIcon} size={24} />
                                            }
                                        </button>
                                        <div className={styles.scheduleInfo}>
                                            <span className={styles.schedulePeptide}>
                                                {schedule.peptide}
                                                {schedule.isRecurring && <Repeat size={12} className={styles.recurringIcon} />}
                                            </span>
                                            <span className={styles.scheduleDetails}>
                                                {schedule.dosage} {schedule.unit} • {schedule.time}
                                            </span>
                                            {schedule.notes && (
                                                <span className={styles.scheduleNotes}>{schedule.notes}</span>
                                            )}
                                        </div>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => deleteSchedule(schedule.id)}
                                            aria-label="Delete schedule"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Protocols View */}
            {view === 'protocols' && (
                <div className={`card glass-panel ${styles.protocolsSection}`}>
                    <div className={styles.protocolsHeader}>
                        <h2><Repeat size={20} /> Recurring Protocols</h2>
                        <button
                            className={styles.addBtn}
                            onClick={() => { setFormMode('recurring'); setIsFormOpen(true); }}
                        >
                            <Plus size={18} />
                            Create Protocol
                        </button>
                    </div>

                    {/* Create Protocol Form */}
                    {isFormOpen && formMode === 'recurring' && (
                        <form className={styles.protocolForm} onSubmit={handleSubmit}>
                            <div className={styles.formSection}>
                                <h3><Zap size={16} /> Quick Protocols</h3>
                                <div className={styles.quickProtocols}>
                                    {QUICK_PROTOCOLS.slice(0, 6).map(protocol => (
                                        <button
                                            key={protocol.id}
                                            type="button"
                                            className={`${styles.quickProtocolBtn} ${JSON.stringify(formData.recurrenceDays) === JSON.stringify(protocol.days)
                                                    ? styles.quickProtocolActive : ''
                                                }`}
                                            onClick={() => applyQuickProtocol(protocol)}
                                        >
                                            <span className={styles.protocolEmoji}>{protocol.icon}</span>
                                            {protocol.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <h3><Calendar size={16} /> Select Days</h3>
                                <div className={styles.daysSelector}>
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day.value}
                                            type="button"
                                            className={`${styles.dayBtn} ${formData.recurrenceDays.includes(day.value) ? styles.dayBtnActive : ''
                                                }`}
                                            onClick={() => toggleDay(day.value)}
                                        >
                                            <span className={styles.dayShort}>{day.short}</span>
                                            <span className={styles.dayLabel}>{day.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className={styles.daysHint}>
                                    Selected: {getDaysLabel(formData.recurrenceDays)}
                                </p>
                            </div>

                            <div className={styles.formSection}>
                                <h3>Protocol Details</h3>
                                <div className={styles.inputGroup}>
                                    <label>Protocol Name (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Morning Semaglutide"
                                    />
                                </div>

                                <div className={styles.inputGroup} ref={autocompleteRef}>
                                    <label>Peptide</label>
                                    <div className={styles.autocompleteWrapper}>
                                        <input
                                            type="text"
                                            value={formData.peptide}
                                            onChange={e => setFormData({ ...formData, peptide: e.target.value })}
                                            onFocus={() => setShowAutocomplete(true)}
                                            placeholder="Search peptide..."
                                            autoComplete="off"
                                            required
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

                                <div className={styles.formRow}>
                                    <div className={styles.inputGroup}>
                                        <label>Dosage</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.dosage}
                                            onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                                            placeholder="0.5"
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
                                            <option value="IU">IU</option>
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Time</label>
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Schedule Duration</label>
                                    <select
                                        value={formData.weeks}
                                        onChange={e => setFormData({ ...formData, weeks: parseInt(e.target.value) })}
                                    >
                                        <option value={2}>2 Weeks</option>
                                        <option value={4}>4 Weeks (1 Month)</option>
                                        <option value={8}>8 Weeks (2 Months)</option>
                                        <option value={12}>12 Weeks (3 Months)</option>
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Notes (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="e.g., Take on empty stomach"
                                    />
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setIsFormOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    <CalendarPlus size={18} />
                                    Create Protocol
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Active Protocols List */}
                    {!isFormOpen && (
                        <div className={styles.protocolsList}>
                            {templates.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Repeat size={48} className={styles.emptyIcon} />
                                    <p>No recurring protocols</p>
                                    <span>Create a protocol to automatically schedule doses on specific days</span>
                                </div>
                            ) : (
                                templates.map(template => (
                                    <div key={template.id} className={styles.protocolCard}>
                                        <div className={styles.protocolInfo}>
                                            <h4>{template.name}</h4>
                                            <p className={styles.protocolPeptide}>
                                                {template.peptide} • {template.dosage} {template.unit}
                                            </p>
                                            <div className={styles.protocolDays}>
                                                {DAYS_OF_WEEK.map(day => (
                                                    <span
                                                        key={day.value}
                                                        className={`${styles.protocolDayDot} ${template.recurrenceDays.includes(day.value)
                                                                ? styles.protocolDayActive : ''
                                                            }`}
                                                    >
                                                        {day.short}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className={styles.protocolTime}>
                                                <Clock size={12} /> {template.time}
                                            </p>
                                        </div>
                                        <button
                                            className={styles.deleteProtocolBtn}
                                            onClick={() => {
                                                if (confirm('Delete this protocol and all its scheduled doses?')) {
                                                    deleteTemplate(template.id, true);
                                                }
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Upcoming View */}
            {view === 'upcoming' && (
                <div className={`card glass-panel ${styles.upcomingSection}`}>
                    <h2><Clock size={20} /> Upcoming Doses (Next 7 Days)</h2>

                    {upcomingSchedules.length === 0 ? (
                        <div className={styles.emptyState}>
                            <CalendarCheck size={48} className={styles.emptyIcon} />
                            <p>No upcoming doses</p>
                            <span>Your schedule is clear for the next week</span>
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
                                            <span className={styles.upcomingDay}>{format(schedDate, 'EEE')}</span>
                                            <span className={styles.upcomingDayNum}>{format(schedDate, 'd')}</span>
                                            {isScheduleToday && <span className={styles.todayBadge}>Today</span>}
                                        </div>
                                        <button
                                            className={styles.scheduleToggle}
                                            onClick={() => toggleComplete(schedule.id)}
                                        >
                                            {schedule.completed ?
                                                <CheckCircle className={styles.checkIcon} size={22} /> :
                                                <Circle className={styles.circleIcon} size={22} />
                                            }
                                        </button>
                                        <div className={styles.upcomingInfo}>
                                            <span className={styles.schedulePeptide}>
                                                {schedule.peptide}
                                                {schedule.isRecurring && <Repeat size={12} className={styles.recurringIcon} />}
                                            </span>
                                            <span className={styles.scheduleDetails}>
                                                {schedule.dosage} {schedule.unit} • {schedule.time}
                                            </span>
                                        </div>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => deleteSchedule(schedule.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalendarScheduler;
