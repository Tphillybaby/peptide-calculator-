import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { addDays, eachDayOfInterval, getDay, startOfDay, format, isAfter, isBefore, isSameDay } from 'date-fns';
import { notificationService } from '../services/notificationService';
import { localNotifications, device } from '../services/nativeService';
import { paymentService } from '../services/paymentService';

const STORAGE_KEY = 'peptide_tracker_schedule';
const TEMPLATES_KEY = 'peptide_tracker_templates';

export const useSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchSchedules().then((data) => {
                if (data && device.isNative) {
                    syncMobileNotifications(data);
                }
            });
            fetchTemplates();
        } else {
            loadFromLocalStorage();
        }
    }, [user]);

    // Helper to explicitly sync notification from passed data
    const syncMobileNotifications = (currentSchedules) => {
        if (!device.isNative || !currentSchedules || currentSchedules.length === 0) return;

        console.log('Syncing mobile notifications for', currentSchedules.length, 'schedules');

        localNotifications.getPending().then(pending => {
            const ids = pending.map(n => n.id);
            if (ids.length > 0) localNotifications.cancel(ids);

            currentSchedules.forEach(schedule => {
                if (schedule.completed) return;
                const scheduleDate = new Date(schedule.date);
                if (scheduleDate > new Date()) {
                    localNotifications.scheduleInjectionReminder({
                        id: parseInt(schedule.id.toString().replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 100000),
                        title: 'Time for your dose!',
                        body: `Take ${schedule.peptide} (${schedule.dosage}${schedule.unit})`,
                        scheduledAt: scheduleDate
                    });
                }
            });
        });
    };

    // Schedule notifications whenever schedules change
    useEffect(() => {
        if (schedules.length > 0) {
            // Web Notifications
            if (!device.isNative) {
                notificationService.scheduleReminders(schedules);
            }
            // Native Notifications
            else {
                // Clear all pending first to avoid duplicates (naive approach, but safe)
                // In a real app, we'd diff them, but for now re-scheduling upcoming is safer
                localNotifications.getPending().then(pending => {
                    const ids = pending.map(n => n.id);
                    if (ids.length > 0) localNotifications.cancel(ids);

                    // Schedule new ones
                    schedules.forEach(schedule => {
                        if (schedule.completed) return;

                        const scheduleDate = new Date(schedule.date);
                        if (scheduleDate > new Date()) {
                            localNotifications.scheduleInjectionReminder({
                                id: parseInt(schedule.id.toString().replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 100000), // Ensure integer ID for valid notification
                                title: 'Time for your dose!',
                                body: `Take ${schedule.peptide} (${schedule.dosage}${schedule.unit})`,
                                scheduledAt: scheduleDate
                            });
                        }
                    });
                });
            }
        }
    }, [schedules]);

    const loadFromLocalStorage = () => {
        try {
            const storedSchedules = localStorage.getItem(STORAGE_KEY);
            const storedTemplates = localStorage.getItem(TEMPLATES_KEY);
            if (storedSchedules) {
                setSchedules(JSON.parse(storedSchedules));
            }
            if (storedTemplates) {
                setTemplates(JSON.parse(storedTemplates));
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
        setLoading(false);
    };

    const saveToLocalStorage = (data, key = STORAGE_KEY) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('schedules')
                .select('*')
                .eq('user_id', user.id)
                .order('scheduled_date', { ascending: true });

            if (error) throw error;

            const formattedData = data.map(item => ({
                id: item.id,
                date: new Date(`${item.scheduled_date}T${item.scheduled_time}`).toISOString(),
                peptide: item.peptide_name,
                dosage: item.dosage,
                unit: item.unit,
                time: item.scheduled_time?.slice(0, 5) || '08:00',
                completed: item.completed,
                notes: item.notes,
                isRecurring: item.is_recurring || false,
                parentTemplateId: item.parent_schedule_id
            }));

            setSchedules(formattedData);
            return formattedData;
        } catch (error) {
            console.error('Error fetching schedules:', error);
            loadFromLocalStorage();
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const { data, error } = await supabase
                .from('schedule_templates')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedTemplates = data.map(item => ({
                id: item.id,
                name: item.name,
                peptide: item.peptide_name,
                dosage: item.dosage,
                unit: item.unit,
                time: item.time?.slice(0, 5) || '08:00',
                recurrenceDays: item.recurrence_days || [],
                isActive: item.is_active,
                notes: item.notes
            }));

            setTemplates(formattedTemplates);
        } catch (error) {
            console.error('Error fetching templates:', error);
            // Silent fail - templates are optional
        }
    };

    // Add a single schedule entry
    const addSchedule = async (schedule) => {
        const newSchedule = {
            id: 'temp-' + Date.now(),
            completed: false,
            ...schedule
        };

        const updated = [...schedules, newSchedule];
        setSchedules(updated);

        if (user) {
            try {
                // Check limits for schedules
                const limitCheck = await paymentService.checkUsageLimits(user.id);
                if (limitCheck.success && limitCheck.usage.schedules.remaining <= 0) {
                    throw new Error('LIMIT_REACHED: Free limit reached (5 active schedules). Upgrade to Premium.');
                }

                const scheduleDate = new Date(schedule.date);
                const { data, error } = await supabase
                    .from('schedules')
                    .insert([{
                        user_id: user.id,
                        peptide_name: schedule.peptide,
                        dosage: schedule.dosage,
                        unit: schedule.unit,
                        scheduled_date: scheduleDate.toISOString().split('T')[0],
                        scheduled_time: schedule.time + ':00',
                        completed: false,
                        notes: schedule.notes || null,
                        is_recurring: false
                    }])
                    .select()
                    .single();

                if (error) throw error;

                setSchedules(prev => prev.map(s =>
                    s.id === newSchedule.id ? { ...s, id: data.id } : s
                ));
            } catch (error) {
                console.error('Error adding schedule:', error);
                fetchSchedules();
            }
        } else {
            saveToLocalStorage(updated);
        }
    };

    // Create a recurring schedule template and generate schedules
    const createRecurringSchedule = async (template, startDate, endDate) => {
        const { peptide, dosage, unit, time, recurrenceDays, notes, name } = template;

        // Generate schedule entries for the date range
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const schedulesToAdd = days
            .filter(day => recurrenceDays.includes(getDay(day)))
            .map(day => {
                // Create date at local noon to avoid timezone issues
                const localDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0);
                return {
                    id: 'temp-' + Date.now() + '-' + day.getTime(),
                    date: localDate.toISOString(),
                    peptide,
                    dosage,
                    unit,
                    time,
                    completed: false,
                    notes,
                    isRecurring: true
                };
            });

        // Optimistic update
        setSchedules(prev => [...prev, ...schedulesToAdd]);

        if (user) {
            try {
                // Check limits for schedules (templates often count as schedules or separate limit?)
                // Assuming templates count towards schedule limit or have their own. 
                // paymentService checks 'schedules' table count. Templates are 'schedule_templates'.
                // If the user is creating a recurring schedule, it creates a template AND multiple schedule entries.
                // The free tier likely limites *active schedules* or *templates*.
                // Let's assume we check schedule count. If adding 30 days, that's 30 schedules.
                // Free limit is 5.
                // This effectively blocks recurring schedules for free users unless they only do 5 days.
                // Which is intentional.

                const limitCheck = await paymentService.checkUsageLimits(user.id);
                if (limitCheck.success && limitCheck.usage.schedules.remaining < schedulesToAdd.length) {
                    throw new Error(`LIMIT_REACHED: This would exceed your schedule limit. You have ${limitCheck.usage.schedules.remaining} remaining, but tried to add ${schedulesToAdd.length}. Upgrade to Premium.`);
                }

                // First, save the template
                const { data: templateData, error: templateError } = await supabase
                    .from('schedule_templates')
                    .insert([{
                        user_id: user.id,
                        name: name || `${peptide} Protocol`,
                        peptide_name: peptide,
                        dosage,
                        unit,
                        time: time + ':00',
                        recurrence_days: recurrenceDays,
                        is_active: true,
                        notes
                    }])
                    .select()
                    .single();

                if (templateError) throw templateError;

                // Then, insert all the schedule entries
                const scheduleInserts = schedulesToAdd.map(s => ({
                    user_id: user.id,
                    peptide_name: s.peptide,
                    dosage: s.dosage,
                    unit: s.unit,
                    scheduled_date: new Date(s.date).toISOString().split('T')[0],
                    scheduled_time: s.time + ':00',
                    completed: false,
                    notes: s.notes,
                    is_recurring: true,
                    parent_schedule_id: templateData.id
                }));

                const { error: schedulesError } = await supabase
                    .from('schedules')
                    .insert(scheduleInserts);

                if (schedulesError) throw schedulesError;

                // Refresh to get real IDs
                await fetchSchedules();
                await fetchTemplates();

                return templateData;
            } catch (error) {
                console.error('Error creating recurring schedule:', error);
                fetchSchedules();
                return null;
            }
        } else {
            // Local storage fallback
            saveToLocalStorage([...schedules, ...schedulesToAdd]);
            const newTemplate = {
                id: 'local-' + Date.now(),
                name: name || `${peptide} Protocol`,
                peptide,
                dosage,
                unit,
                time,
                recurrenceDays,
                isActive: true,
                notes
            };
            const updatedTemplates = [...templates, newTemplate];
            setTemplates(updatedTemplates);
            saveToLocalStorage(updatedTemplates, TEMPLATES_KEY);
            return newTemplate;
        }
    };

    // Delete a template and optionally all its generated schedules
    const deleteTemplate = async (templateId, deleteSchedules = false) => {
        if (user) {
            try {
                if (deleteSchedules) {
                    // Delete all schedules linked to this template
                    await supabase
                        .from('schedules')
                        .delete()
                        .eq('parent_schedule_id', templateId);
                }

                // Delete the template
                const { error } = await supabase
                    .from('schedule_templates')
                    .delete()
                    .eq('id', templateId);

                if (error) throw error;

                await fetchTemplates();
                if (deleteSchedules) await fetchSchedules();
            } catch (error) {
                console.error('Error deleting template:', error);
            }
        } else {
            const updated = templates.filter(t => t.id !== templateId);
            setTemplates(updated);
            saveToLocalStorage(updated, TEMPLATES_KEY);
            if (deleteSchedules) {
                const updatedSchedules = schedules.filter(s => s.parentTemplateId !== templateId);
                setSchedules(updatedSchedules);
                saveToLocalStorage(updatedSchedules);
            }
        }
    };

    // Extend a recurring schedule for more weeks
    const extendRecurringSchedule = async (templateId, additionalDays = 28) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        // Find the last scheduled date for this template
        const templateSchedules = schedules.filter(s => s.parentTemplateId === templateId);
        const lastDate = templateSchedules.reduce((max, s) => {
            const d = new Date(s.date);
            return d > max ? d : max;
        }, new Date());

        const startDate = addDays(lastDate, 1);
        const endDate = addDays(startDate, additionalDays);

        // Generate new schedules
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const schedulesToAdd = days
            .filter(day => template.recurrenceDays.includes(getDay(day)))
            .map(day => {
                // Create date at local noon to avoid timezone issues
                const localDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0);
                return {
                    id: 'temp-' + Date.now() + '-' + day.getTime(),
                    date: localDate.toISOString(),
                    peptide: template.peptide,
                    dosage: template.dosage,
                    unit: template.unit,
                    time: template.time,
                    completed: false,
                    notes: template.notes,
                    isRecurring: true,
                    parentTemplateId: templateId
                };
            });

        setSchedules(prev => [...prev, ...schedulesToAdd]);

        if (user) {
            try {
                const scheduleInserts = schedulesToAdd.map(s => ({
                    user_id: user.id,
                    peptide_name: s.peptide,
                    dosage: s.dosage,
                    unit: s.unit,
                    scheduled_date: new Date(s.date).toISOString().split('T')[0],
                    scheduled_time: s.time + ':00',
                    completed: false,
                    notes: s.notes,
                    is_recurring: true,
                    parent_schedule_id: templateId
                }));

                await supabase.from('schedules').insert(scheduleInserts);
                await fetchSchedules();
            } catch (error) {
                console.error('Error extending schedule:', error);
                fetchSchedules();
            }
        } else {
            saveToLocalStorage([...schedules, ...schedulesToAdd]);
        }
    };

    const deleteSchedule = async (id) => {
        const updated = schedules.filter(s => s.id !== id);
        setSchedules(updated);

        if (user) {
            try {
                const { error } = await supabase
                    .from('schedules')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
            } catch (error) {
                console.error('Error deleting schedule:', error);
                fetchSchedules();
            }
        } else {
            saveToLocalStorage(updated);
        }
    };

    const toggleComplete = async (id) => {
        const schedule = schedules.find(s => s.id === id);
        if (!schedule) return;

        const newCompleted = !schedule.completed;
        const updated = schedules.map(s =>
            s.id === id ? { ...s, completed: newCompleted } : s
        );
        setSchedules(updated);

        if (user) {
            try {
                const { error } = await supabase
                    .from('schedules')
                    .update({ completed: newCompleted })
                    .eq('id', id);

                if (error) throw error;
            } catch (error) {
                console.error('Error toggling schedule:', error);
                fetchSchedules();
            }
        } else {
            saveToLocalStorage(updated);
        }
    };

    // Get upcoming schedules (next N days)
    const getUpcomingSchedules = useCallback((days = 7) => {
        const today = startOfDay(new Date());
        const endDate = addDays(today, days);

        return schedules.filter(s => {
            const date = new Date(s.date);
            return (isAfter(date, today) || isSameDay(date, today)) && isBefore(date, endDate);
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [schedules]);

    // Get schedules grouped by peptide
    const getSchedulesByPeptide = useCallback(() => {
        const grouped = {};
        schedules.forEach(s => {
            if (!grouped[s.peptide]) {
                grouped[s.peptide] = [];
            }
            grouped[s.peptide].push(s);
        });
        return grouped;
    }, [schedules]);

    return {
        schedules,
        templates,
        loading,
        addSchedule,
        createRecurringSchedule,
        deleteTemplate,
        extendRecurringSchedule,
        deleteSchedule,
        toggleComplete,
        getUpcomingSchedules,
        getSchedulesByPeptide,
        refreshSchedules: fetchSchedules,
        refreshTemplates: fetchTemplates
    };
};
