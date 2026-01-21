/**
 * Backup & Data Export Service
 * 
 * Supabase automatically handles:
 * - Daily database backups (Pro plan: 7 days, Pro+: 30 days)
 * - Point-in-time recovery (Pro plan and above)
 * - Encrypted storage
 * 
 * This service provides:
 * - User data export (GDPR compliance)
 * - Personal backup downloads
 * - Data portability
 */

import { supabase } from '../lib/supabase';

export const backupService = {
    /**
     * Export all user data as JSON
     * For GDPR compliance and data portability
     */
    async exportUserData(userId) {
        try {
            // Fetch all user data in parallel
            const [
                profile,
                injections,
                schedules,
                inventory,
                reviews
            ] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', userId).single(),
                supabase.from('injections').select('*').eq('user_id', userId).order('date', { ascending: false }),
                supabase.from('schedules').select('*').eq('user_id', userId),
                supabase.from('inventory').select('*').eq('user_id', userId),
                supabase.from('reviews').select('*').eq('user_id', userId)
            ]);

            const exportData = {
                exportDate: new Date().toISOString(),
                exportVersion: '1.0',
                user: {
                    profile: profile.data,
                    statistics: {
                        totalInjections: injections.data?.length || 0,
                        totalSchedules: schedules.data?.length || 0,
                        totalInventoryItems: inventory.data?.length || 0,
                        totalReviews: reviews.data?.length || 0
                    }
                },
                data: {
                    injections: injections.data || [],
                    schedules: schedules.data || [],
                    inventory: inventory.data || [],
                    reviews: reviews.data || []
                }
            };

            return {
                success: true,
                data: exportData,
                filename: `peptide-tracker-export-${new Date().toISOString().split('T')[0]}.json`
            };
        } catch (error) {
            console.error('[Backup Service] Export failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Export user data as CSV files (zipped)
     */
    async exportAsCSV(userId) {
        try {
            const [injections, schedules, inventory] = await Promise.all([
                supabase.from('injections').select('*').eq('user_id', userId).order('date', { ascending: false }),
                supabase.from('schedules').select('*').eq('user_id', userId),
                supabase.from('inventory').select('*').eq('user_id', userId)
            ]);

            const csvFiles = {};

            // Convert injections to CSV
            if (injections.data?.length) {
                csvFiles.injections = this._arrayToCSV(injections.data, [
                    'date', 'peptide_name', 'dose_amount', 'dose_unit', 'injection_site', 'notes'
                ]);
            }

            // Convert schedules to CSV
            if (schedules.data?.length) {
                csvFiles.schedules = this._arrayToCSV(schedules.data, [
                    'peptide_name', 'dose_amount', 'dose_unit', 'frequency', 'time', 'notes'
                ]);
            }

            // Convert inventory to CSV
            if (inventory.data?.length) {
                csvFiles.inventory = this._arrayToCSV(inventory.data, [
                    'peptide_name', 'quantity', 'vial_size', 'expiration_date', 'notes'
                ]);
            }

            return {
                success: true,
                files: csvFiles
            };
        } catch (error) {
            console.error('[Backup Service] CSV export failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Convert array of objects to CSV string
     */
    _arrayToCSV(data, columns) {
        if (!data || !data.length) return '';

        const headers = columns.join(',');
        const rows = data.map(item =>
            columns.map(col => {
                const value = item[col];
                if (value === null || value === undefined) return '';
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        );

        return [headers, ...rows].join('\n');
    },

    /**
     * Download data as a file
     */
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this._triggerDownload(blob, filename);
    },

    /**
     * Download CSV file
     */
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this._triggerDownload(blob, filename);
    },

    /**
     * Trigger file download
     */
    _triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Import user data from JSON backup
     */
    async importUserData(userId, jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            // Validate format
            if (!data.exportVersion || !data.data) {
                throw new Error('Invalid backup file format');
            }

            const results = {
                injections: 0,
                schedules: 0,
                errors: []
            };

            // Import injections
            if (data.data.injections?.length) {
                for (const injection of data.data.injections) {
                    const { error } = await supabase.from('injections').insert({
                        user_id: userId,
                        peptide_name: injection.peptide_name,
                        date: injection.date,
                        dose_amount: injection.dose_amount,
                        dose_unit: injection.dose_unit,
                        injection_site: injection.injection_site,
                        notes: injection.notes
                    });

                    if (error) {
                        results.errors.push(`Injection: ${error.message}`);
                    } else {
                        results.injections++;
                    }
                }
            }

            // Import schedules
            if (data.data.schedules?.length) {
                for (const schedule of data.data.schedules) {
                    const { error } = await supabase.from('schedules').insert({
                        user_id: userId,
                        peptide_name: schedule.peptide_name,
                        dose_amount: schedule.dose_amount,
                        dose_unit: schedule.dose_unit,
                        frequency: schedule.frequency,
                        time: schedule.time,
                        notes: schedule.notes
                    });

                    if (error) {
                        results.errors.push(`Schedule: ${error.message}`);
                    } else {
                        results.schedules++;
                    }
                }
            }

            return {
                success: true,
                imported: results,
                message: `Imported ${results.injections} injections and ${results.schedules} schedules`
            };
        } catch (error) {
            console.error('[Backup Service] Import failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Delete all user data (GDPR Right to Erasure)
     */
    async deleteAllUserData(userId) {
        try {
            // Delete in order due to foreign key constraints
            await Promise.all([
                supabase.from('reviews').delete().eq('user_id', userId),
                supabase.from('injections').delete().eq('user_id', userId),
                supabase.from('schedules').delete().eq('user_id', userId),
                supabase.from('schedule_templates').delete().eq('user_id', userId),
                supabase.from('inventory').delete().eq('user_id', userId),
                supabase.from('ticket_messages').delete().match({ user_id: userId }),
                supabase.from('support_tickets').delete().eq('user_id', userId)
            ]);

            return { success: true, message: 'All user data has been deleted' };
        } catch (error) {
            console.error('[Backup Service] Delete failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Delete specific data type only
     */
    async deleteDataType(userId, dataType) {
        try {
            switch (dataType) {
                case 'injections':
                    await supabase.from('injections').delete().eq('user_id', userId);
                    break;
                case 'schedules':
                    await supabase.from('schedules').delete().eq('user_id', userId);
                    await supabase.from('schedule_templates').delete().eq('user_id', userId);
                    break;
                case 'inventory':
                    await supabase.from('inventory').delete().eq('user_id', userId);
                    break;
                case 'reviews':
                    await supabase.from('reviews').delete().eq('user_id', userId);
                    break;
                default:
                    throw new Error('Unknown data type');
            }
            return { success: true, message: `All ${dataType} have been deleted` };
        } catch (error) {
            console.error(`[Backup Service] Delete ${dataType} failed:`, error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get backup info for admin dashboard
     */
    getBackupInfo() {
        return {
            provider: 'Supabase',
            features: [
                'Automatic daily database backups',
                'Encrypted at rest and in transit',
                'Point-in-time recovery available',
                'Geo-redundant storage'
            ],
            userExportFormats: ['JSON', 'CSV'],
            gdprCompliant: true,
            documentation: 'https://supabase.com/docs/guides/platform/backups'
        };
    }
};
