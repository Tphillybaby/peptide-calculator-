import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

const STORAGE_KEY = 'peptide_tracker_inventory';
const LOW_STOCK_THRESHOLD = 10; // mg

export const useInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        setInventory([]);
        if (user) {
            fetchInventory();
        } else {
            loadFromLocalStorage();
        }
    }, [user]);

    const loadFromLocalStorage = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setInventory(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading inventory from localStorage:', error);
        }
        setLoading(false);
    };

    const saveToLocalStorage = (data) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving inventory to localStorage:', error);
        }
    };

    const fetchInventory = async () => {
        try {
            setLoading(true);
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
            loadFromLocalStorage();
        } finally {
            setLoading(false);
        }
    };

    const checkLowStock = (items) => {
        items.forEach(item => {
            if (item.remaining_mg <= LOW_STOCK_THRESHOLD && item.remaining_mg > 0) {
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
    };

    const addInventory = async (item) => {
        const newItem = {
            id: 'temp-' + Date.now(),
            ...item,
            remaining_mg: item.quantity_mg,
            created_at: new Date().toISOString()
        };

        const updated = [newItem, ...inventory];
        setInventory(updated);

        if (user) {
            try {
                const { data, error } = await supabase
                    .from('inventory')
                    .insert([{
                        user_id: user.id,
                        peptide_name: item.peptide_name,
                        quantity_mg: item.quantity_mg,
                        remaining_mg: item.quantity_mg,
                        purchase_date: item.purchase_date || null,
                        expiration_date: item.expiration_date || null,
                        batch_number: item.batch_number || null,
                        source: item.source || null
                    }])
                    .select()
                    .single();

                if (error) throw error;

                setInventory(prev => prev.map(i =>
                    i.id === newItem.id ? data : i
                ));
            } catch (error) {
                console.error('Error adding inventory:', error);
                fetchInventory();
            }
        } else {
            saveToLocalStorage(updated);
        }
    };

    const updateInventory = async (id, updates) => {
        const updated = inventory.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );
        setInventory(updated);

        if (user) {
            try {
                const { error } = await supabase
                    .from('inventory')
                    .update(updates)
                    .eq('id', id);

                if (error) throw error;

                // Check if this update triggers low stock alert
                const updatedItem = updated.find(i => i.id === id);
                if (updatedItem) {
                    checkLowStock([updatedItem]);
                }
            } catch (error) {
                console.error('Error updating inventory:', error);
                fetchInventory();
            }
        } else {
            saveToLocalStorage(updated);
        }
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
            console.log('No inventory found for', peptideName);
            return false;
        }

        const newRemaining = Math.max(0, item.remaining_mg - amountMg);
        await updateInventory(item.id, { remaining_mg: newRemaining });

        return true;
    };

    const getLowStockItems = () => {
        return inventory.filter(item =>
            item.remaining_mg <= LOW_STOCK_THRESHOLD && item.remaining_mg > 0
        );
    };

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
