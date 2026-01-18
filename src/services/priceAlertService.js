import { supabase } from '../lib/supabase';

export const priceAlertService = {
    // Create a new price alert
    async createAlert(userId, peptideName, targetPrice, vendorId = null) {
        try {
            const { data, error } = await supabase
                .from('price_alerts')
                .insert([{
                    user_id: userId,
                    peptide_name: peptideName,
                    target_price: targetPrice,
                    vendor_id: vendorId,
                    is_active: true
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating price alert:', error);
            return { success: false, error: error.message };
        }
    },

    // Get alerts for a user
    async getAlerts(userId) {
        try {
            const { data, error } = await supabase
                .from('price_alerts')
                .select(`
          *,
          vendors (
            name
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return [];
        }
    },

    // Delete an alert
    async deleteAlert(alertId) {
        try {
            const { error } = await supabase
                .from('price_alerts')
                .delete()
                .eq('id', alertId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting alert:', error);
            return { success: false, error: error.message };
        }
    },

    // Toggle alert status
    async toggleAlert(alertId, isActive) {
        try {
            const { error } = await supabase
                .from('price_alerts')
                .update({ is_active: isActive })
                .eq('id', alertId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error toggling alert:', error);
            return { success: false, error: error.message };
        }
    }
};
