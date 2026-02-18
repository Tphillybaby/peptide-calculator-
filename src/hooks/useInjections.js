import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';

const LOCAL_STORAGE_KEY = 'peptide_tracker_injections';

// Helper to safely get from localStorage
const getLocalInjections = () => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Helper to save to localStorage
const saveLocalInjections = (injections) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(injections));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

export const useInjections = () => {
    const [injections, setInjections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Fetch injections from Supabase (for authenticated users)
    const fetchFromSupabase = useCallback(async () => {
        try {
            setError(null);
            const { data, error: fetchError } = await supabase
                .from('injections')
                .select('*')
                .eq('user_id', user.id)
                .order('injection_date', { ascending: false });

            if (fetchError) throw fetchError;

            // Map database fields to frontend model
            const formattedData = (data || []).map(item => ({
                id: item.id,
                peptide: item.peptide_name,
                dosage: item.dosage_value || item.dosage_mcg / 1000, // Convert mcg to mg for display
                unit: item.dosage_unit || 'mg',
                date: item.injection_date,
                notes: item.notes || '',
                site: item.injection_site || 'Abdomen',
                bodyWeightLbs: item.body_weight_lbs || null
            }));

            setInjections(formattedData);
        } catch (err) {
            console.error('Error fetching injections:', err);
            setError('Failed to load injections');
        }
    }, []);

    // Fetch injections from localStorage (for guests)
    const fetchFromLocal = useCallback(() => {
        const localData = getLocalInjections();
        // Sort by date descending
        localData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setInjections(localData);
    }, []);

    // Initial load
    useEffect(() => {
        setLoading(true);

        if (user && user.id !== 'mock-user-id') {
            fetchFromSupabase().finally(() => setLoading(false));
        } else {
            fetchFromLocal();
            setLoading(false);
        }
    }, [user, fetchFromSupabase, fetchFromLocal]);

    // Add injection
    const addInjection = async (injection) => {
        const newInjection = {
            ...injection,
            id: injection.id || crypto.randomUUID(),
            date: injection.date || new Date().toISOString()
        };

        // Optimistic update
        setInjections(prev => [newInjection, ...prev]);

        if (user && user.id !== 'mock-user-id') {
            // Check limits for free users
            const limitCheck = await paymentService.checkUsageLimits(user.id);
            if (limitCheck.success && limitCheck.usage.injections.remaining <= 0) {
                setError('Free limit reached (50 injections). Upgrade to Premium for unlimited tracking.');
                // Revert optimistic update
                setInjections(prev => prev.filter(i => i.id !== newInjection.id));
                return {
                    success: false,
                    error: new Error('LIMIT_REACHED'),
                    message: 'Free limit reached. Upgrade for unlimited tracking.'
                };
            }

            // Save to Supabase
            try {
                const dosageInMg = injection.unit === 'mg'
                    ? injection.dosage
                    : injection.unit === 'mcg'
                        ? injection.dosage / 1000
                        : 0; // Ignore IU for mass deduction

                // 1. Insert Injection
                const { data, error: insertError } = await supabase
                    .from('injections')
                    .insert([{
                        user_id: user.id,
                        peptide_name: injection.peptide,
                        dosage_mcg: injection.unit === 'mg'
                            ? injection.dosage * 1000
                            : injection.unit === 'mcg'
                                ? injection.dosage
                                : injection.dosage, // IU stays as is
                        dosage_value: injection.dosage,
                        dosage_unit: injection.unit,
                        injection_date: newInjection.date,
                        injection_site: injection.site,
                        body_weight_lbs: injection.bodyWeightLbs || null,
                        notes: injection.notes || ''
                    }])
                    .select()
                    .single();

                if (insertError) throw insertError;

                // 2. Auto-Deduct from Inventory
                if (dosageInMg > 0) {
                    try {
                        // Find oldest inventory item with stock
                        const { data: inventoryItems } = await supabase
                            .from('inventory')
                            .select('id, remaining_mg, user_id')
                            .eq('user_id', user.id)
                            .eq('peptide_name', injection.peptide)
                            .gt('remaining_mg', 0)
                            .order('created_at', { ascending: true })
                            .limit(1);

                        if (inventoryItems && inventoryItems.length > 0) {
                            const item = inventoryItems[0];
                            const newRemaining = Math.max(0, item.remaining_mg - dosageInMg);

                            await supabase
                                .from('inventory')
                                .update({ remaining_mg: newRemaining })
                                .eq('id', item.id);
                        }
                    } catch (invError) {
                        console.error('Silent error updating inventory:', invError);
                        // Don't fail the injection log if inventory fails
                    }
                }

                // Update with real ID from database
                setInjections(prev => prev.map(i =>
                    i.id === newInjection.id ? { ...i, id: data.id } : i
                ));

                return { success: true, data };
            } catch (err) {
                console.error('Error adding injection:', err);
                // Revert optimistic update
                setInjections(prev => prev.filter(i => i.id !== newInjection.id));
                setError('Failed to save injection');
                return { success: false, error: err };
            }
        } else {
            // Save to localStorage for guests
            const currentInjections = getLocalInjections();
            if (currentInjections.length >= 50) {
                setError('Free limit reached (50 injections). Sign up for more.');
                // Revert optimistic update
                setInjections(prev => prev.filter(i => i.id !== newInjection.id));
                return { success: false, error: new Error('LIMIT_REACHED') };
            }
            saveLocalInjections([newInjection, ...currentInjections]);
            return { success: true, data: newInjection };
        }
    };

    // Update injection
    const updateInjection = async (id, updates) => {
        // Optimistic update
        setInjections(prev => prev.map(i =>
            i.id === id ? { ...i, ...updates } : i
        ));

        if (user && user.id !== 'mock-user-id') {
            try {
                const { error: updateError } = await supabase
                    .from('injections')
                    .update({
                        peptide_name: updates.peptide,
                        dosage_mcg: updates.unit === 'mg'
                            ? updates.dosage * 1000
                            : updates.dosage,
                        dosage_value: updates.dosage,
                        dosage_unit: updates.unit,
                        injection_date: updates.date,
                        injection_site: updates.site,
                        body_weight_lbs: updates.bodyWeightLbs,
                        notes: updates.notes
                    })
                    .eq('id', id);

                if (updateError) throw updateError;
                return { success: true };
            } catch (err) {
                console.error('Error updating injection:', err);
                fetchFromSupabase(); // Revert to server state
                return { success: false, error: err };
            }
        } else {
            // Update in localStorage
            const currentInjections = getLocalInjections();
            const updated = currentInjections.map(i =>
                i.id === id ? { ...i, ...updates } : i
            );
            saveLocalInjections(updated);
            return { success: true };
        }
    };

    // Delete injection
    const deleteInjection = async (id) => {
        // Optimistic update - store for potential rollback
        const previousInjections = [...injections];
        setInjections(prev => prev.filter(i => i.id !== id));

        if (user && user.id !== 'mock-user-id') {
            try {
                const { error: deleteError } = await supabase
                    .from('injections')
                    .delete()
                    .eq('id', id);

                if (deleteError) throw deleteError;
                return { success: true };
            } catch (err) {
                console.error('Error deleting injection:', err);
                // Revert optimistic update
                setInjections(previousInjections);
                setError('Failed to delete injection');
                return { success: false, error: err };
            }
        } else {
            // Delete from localStorage
            const currentInjections = getLocalInjections();
            const filtered = currentInjections.filter(i => i.id !== id);
            saveLocalInjections(filtered);
            return { success: true };
        }
    };

    // Clear all injections (for guests switching to logged in)
    const clearLocalInjections = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    };

    // Get statistics
    const getStats = useCallback(() => {
        if (injections.length === 0) return null;

        const now = Date.now();
        const lastInjection = injections[0];

        // Calculate active levels (using rough half-life estimates)
        let totalActive = 0;
        injections.forEach(inj => {
            const injTime = new Date(inj.date).getTime();
            if (isNaN(injTime)) return; // Skip invalid dates

            const elapsedHours = (now - injTime) / (1000 * 60 * 60);
            // Use 168 hours (7 days) as default half-life for GLP-1 peptides
            const halfLife = 168;
            const dosageInMg = inj.unit === 'mcg' ? inj.dosage / 1000 : inj.dosage;
            const remaining = dosageInMg * Math.pow(0.5, elapsedHours / halfLife);
            if (remaining > 0.001) { // Only count if above threshold
                totalActive += remaining;
            }
        });

        // Weekly totals
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        const weeklyInjections = injections.filter(i =>
            new Date(i.date).getTime() > oneWeekAgo
        );

        return {
            totalInjections: injections.length,
            lastInjection,
            activeLevel: totalActive.toFixed(3),
            weeklyCount: weeklyInjections.length,
            weeklyDosage: weeklyInjections.reduce((sum, i) =>
                sum + (i.unit === 'mcg' ? i.dosage / 1000 : i.dosage), 0
            ).toFixed(2)
        };
    }, [injections]);

    return {
        injections,
        loading,
        error,
        addInjection,
        updateInjection,
        deleteInjection,
        clearLocalInjections,
        getStats,
        refresh: user && user.id !== 'mock-user-id' ? fetchFromSupabase : fetchFromLocal,
        isUsingLocalStorage: !user || user.id === 'mock-user-id'
    };
};
