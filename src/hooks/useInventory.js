import { lowStockVials } from '../utils/dailyDashboard';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

const STORAGE_KEY = 'peptide_tracker_inventory';

export const useInventory = ({ notifyLowStock = true } = {}) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const loadFromLocalStorage = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setInventory(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading inventory from localStorage:', error);
        }
        setLoading(false);
    }, []);

    const saveToLocalStorage = useCallback((data) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving inventory to localStorage:', error);
        }
    }, []);

    const checkLowStock = useCallback((items) => {
        if (!notifyLowStock) return;
        items.forEach(item => {
            if (lowStockVials([item]).length && item.remaining_mg > 0) {
                // Check if we've already notified for this item recently
                const lastNotified = localStorage.getItem(`low_stock_notified_${item.id}`);
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;

                if (!lastNotified || (now - parseInt(lastNotified)) > oneDay) {
                    notificationService.sendLowStockAlert(
                        item.peptide_name,
                        item.remaining_mg,
                        'mg'
                    );
                    localStorage.setItem(`low_stock_notified_${item.id}`, now.toString());
                }
            }
        });
    }, [notifyLowStock]);

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setInventory(data || []);
            checkLowStock(data || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setError(error);
            setInventory([]);
        } finally {
            setLoading(false);
        }
    }, [user, checkLowStock, loadFromLocalStorage]);

    useEffect(() => {
        setInventory([]);
        if (user) {
            fetchInventory();
        } else {
            loadFromLocalStorage();
        }
    }, [user, fetchInventory, loadFromLocalStorage]);

    const addInventory = async (item) => {
        const record = { ...item, remaining_mg: item.quantity_mg };
        try {
            if (user) {
                const { data, error } = await supabase.from('inventory').insert({ ...record, user_id: user.id }).select().single();
                if (error) throw error;
                setInventory(prev => [data, ...prev]);
            } else {
                const next = [{ ...record, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...inventory];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setInventory(next);
            }
            return { success: true };
        } catch (error) { return { success: false, error }; }
    };

    const updateInventory = async (id, updates) => {
        try {
            let saved = updates;
            if (user) {
                const { data, error } = await supabase.from('inventory').update(updates).eq('id', id).eq('user_id', user.id).select().single();
                if (error) throw error;
                saved = data;
            }
            const next = inventory.map(item => item.id === id ? { ...item, ...saved } : item);
            if (!user) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            setInventory(next); return { success: true };
        } catch (error) { return { success: false, error }; }
    };

    const deleteInventory = async (id) => {
        const updated = inventory.filter(item => item.id !== id);
        setInventory(updated);

        if (user) {
            try {
                const { error } = await supabase
                    .from('inventory')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
            } catch (error) {
                console.error('Error deleting inventory:', error);
                fetchInventory();
            }
        } else {
            saveToLocalStorage(updated);
        }
    };

    const deductFromInventory = async (peptideName, amountMg) => {
        // Find the oldest item with remaining stock for this peptide
        const item = inventory
            .filter(i => i.peptide_name === peptideName && i.remaining_mg > 0)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];

        if (!item) {
            return false;
        }

        const newRemaining = Math.max(0, item.remaining_mg - amountMg);
        await updateInventory(item.id, { remaining_mg: newRemaining });

        return true;
    };

    const getLowStockItems = () => lowStockVials(inventory);

    const getExpiringItems = (daysAhead = 30) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + daysAhead);

        return inventory.filter(item => {
            if (!item.expiration_date) return false;
            const expDate = new Date(item.expiration_date);
            return expDate <= cutoff && item.remaining_mg > 0;
        });
    };

    const getTotalStock = (peptideName = null) => {
        const items = peptideName
            ? inventory.filter(i => i.peptide_name === peptideName)
            : inventory;

        return items.reduce((sum, item) => sum + (item.remaining_mg || 0), 0);
    };

    return {
        inventory,
        loading,
        error,
        addInventory,
        updateInventory,
        deleteInventory,
        deductFromInventory,
        getLowStockItems,
        getExpiringItems,
        getTotalStock,
        refetch: fetchInventory
    };
};

export default useInventory;
