import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'peptide_tracker_schedule';

export const useSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchSchedules();
        } else {
            // Fallback to localStorage for non-logged in users
            loadFromLocalStorage();
        }
    }, [user]);

    const loadFromLocalStorage = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setSchedules(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
        setLoading(false);
    };

    const saveToLocalStorage = (data) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
                .order('scheduled_date', { ascending: true });

            if (error) throw error;

            // Map database fields to frontend model
            const formattedData = data.map(item => ({
                id: item.id,
                date: new Date(`${item.scheduled_date}T${item.scheduled_time}`).toISOString(),
                peptide: item.peptide_name,
                dosage: item.dosage,
                unit: item.unit,
                time: item.scheduled_time.slice(0, 5), // HH:MM format
                completed: item.completed,
                notes: item.notes
            }));

            setSchedules(formattedData);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            // Fallback to localStorage if Supabase fails
            loadFromLocalStorage();
        } finally {
            setLoading(false);
        }
    };

    const addSchedule = async (schedule) => {
        const newSchedule = {
            id: 'temp-' + Date.now(),
            completed: false,
            ...schedule
        };

        // Optimistic update
        const updated = [...schedules, newSchedule];
        setSchedules(updated);

        if (user) {
            try {
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
                        notes: schedule.notes || null
                    }])
                    .select()
                    .single();

                if (error) throw error;

                // Replace temp ID with real one
                setSchedules(prev => prev.map(s =>
                    s.id === newSchedule.id ? {
                        ...s,
                        id: data.id
                    } : s
                ));
            } catch (error) {
                console.error('Error adding schedule:', error);
                // Revert optimistic update on error
                fetchSchedules();
            }
        } else {
            // Save to localStorage for non-logged in users
            saveToLocalStorage(updated);
        }
    };

    const deleteSchedule = async (id) => {
        // Optimistic update
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

        // Optimistic update
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

    return {
        schedules,
        loading,
        addSchedule,
        deleteSchedule,
        toggleComplete
    };
};
