// Audit Log Service
// Handles viewing and querying audit logs

import { supabase } from '../lib/supabase';

export const auditService = {
    // Log an action manually (client-side)
    async logAction(action, entityType, entityId = null, metadata = null) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('audit_logs')
                .insert({
                    user_id: user.id,
                    action,
                    entity_type: entityType,
                    entity_id: entityId,
                    metadata,
                    user_agent: navigator.userAgent
                })
                .select()
                .single();

            if (error) {
                console.warn('Failed to log action:', error);
                return null;
            }
            return data;
        } catch (err) {
            console.warn('Audit log error:', err);
            return null;
        }
    },

    // Get my audit logs
    async getMyLogs(limit = 50) {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.warn('Error fetching my logs:', error);
            if (error.code !== 'PGRST116') throw error;
        }
        return data || [];
    },

    // Admin: Get all audit logs with filters
    async getAllLogs({
        limit = 100,
        offset = 0,
        action = null,
        entityType = null,
        userId = null,
        startDate = null,
        endDate = null
    } = {}) {
        // Build query without relationship syntax to avoid PGRST200 errors
        let query = supabase
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (action) {
            query = query.eq('action', action);
        }
        if (entityType) {
            query = query.eq('entity_type', entityType);
        }
        if (userId) {
            query = query.eq('user_id', userId);
        }
        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        const { data: logsData, error, count } = await query;
        if (error) {
            console.warn('Error fetching audit logs:', error);
            if (error.code !== 'PGRST116') throw error;
        }

        // Get unique user IDs to fetch profiles
        const userIds = [...new Set((logsData || []).map(l => l.user_id).filter(Boolean))];

        // Fetch profiles for these users
        let profileMap = {};
        if (userIds.length > 0) {
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, email, full_name')
                .in('id', userIds);
            profileMap = Object.fromEntries((profilesData || []).map(p => [p.id, p]));
        }

        // Enrich logs with profile data
        const enrichedLogs = (logsData || []).map(log => ({
            ...log,
            profiles: profileMap[log.user_id] || null
        }));

        return { data: enrichedLogs, count: count || 0 };
    },

    // Get unique action types for filtering
    async getActionTypes() {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('action')
            .limit(1000);

        if (error) throw error;

        // Get unique actions
        const uniqueActions = [...new Set(data.map(d => d.action))];
        return uniqueActions.sort();
    },

    // Get unique entity types for filtering
    async getEntityTypes() {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('entity_type')
            .limit(1000);

        if (error) throw error;

        const uniqueTypes = [...new Set(data.map(d => d.entity_type))];
        return uniqueTypes.sort();
    },

    // Get audit log stats
    async getStats(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('audit_logs')
            .select('action, created_at')
            .gte('created_at', startDate.toISOString());

        if (error) throw error;

        // Group by action
        const actionCounts = data.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {});

        // Group by day
        const dailyCounts = data.reduce((acc, log) => {
            const day = new Date(log.created_at).toLocaleDateString();
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});

        return {
            total: data.length,
            byAction: actionCounts,
            byDay: dailyCounts
        };
    },

    // Format action name for display
    formatAction(action) {
        return action
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    },

    // Get action icon/color
    getActionStyle(action) {
        const styles = {
            'profile_updated': { color: '#3b82f6', icon: 'User' },
            'injection_created': { color: '#10b981', icon: 'Plus' },
            'injection_updated': { color: '#f59e0b', icon: 'Edit' },
            'injection_deleted': { color: '#ef4444', icon: 'Trash' },
            'login': { color: '#8b5cf6', icon: 'LogIn' },
            'logout': { color: '#6b7280', icon: 'LogOut' },
            'schedule_created': { color: '#10b981', icon: 'Calendar' },
            'review_created': { color: '#06b6d4', icon: 'Star' }
        };
        return styles[action] || { color: '#6b7280', icon: 'Activity' };
    }
};
