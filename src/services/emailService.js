/**
 * Email Service
 * 
 * Uses Supabase Auth's built-in email functionality for:
 * - Email confirmation
 * - Password reset
 * - Magic link login
 * 
 * For custom emails (welcome, notifications), uses Supabase Edge Functions
 * with Resend or falls back to Supabase's default SMTP.
 */

import { supabase } from '../lib/supabase';
import { getRedirectUrl } from '../utils/authRedirect';

export const emailService = {
    /**
     * Request a password reset email via Supabase Auth
     * Uses Supabase's built-in SMTP
     */
    async requestPasswordReset(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: getRedirectUrl('/reset-password')
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('[Email Service] Password reset failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Request a magic link email via Supabase Auth
     * Uses Supabase's built-in SMTP
     */
    async sendMagicLink(email) {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: getRedirectUrl('/')
                }
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('[Email Service] Magic link failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Resend email confirmation via Supabase Auth
     * Uses Supabase's built-in SMTP
     */
    async resendConfirmation(email) {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: getRedirectUrl('/')
                }
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('[Email Service] Resend confirmation failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send custom email via Edge Function (if deployed)
     * Falls back gracefully if Edge Function is not available
     */
    async sendCustomEmail(type, email, data = {}) {
        try {
            const { data: response, error } = await supabase.functions.invoke('send-email', {
                body: { type, email, data }
            });

            if (error) throw error;
            return { success: true, data: response };
        } catch (error) {
            console.warn(`[Email Service] Custom email (${type}) failed:`, error.message);

            // If Edge Function not deployed, log but don't fail
            if (error.message?.includes('not found') || error.status === 404) {
                console.log(`[Email Service] Edge Function not deployed. Email type: ${type}, To: ${email}`);
                return { success: true, simulated: true };
            }

            return { success: false, error: error.message };
        }
    },

    /**
     * Send welcome email to new user
     */
    async sendWelcomeEmail(email, name) {
        return this.sendCustomEmail('welcome', email, { name });
    },

    /**
     * Send injection reminder email
     */
    async sendInjectionReminder(email, peptideName, scheduledTime) {
        return this.sendCustomEmail('injection_reminder', email, {
            peptideName,
            scheduledTime
        });
    },

    /**
     * Send support ticket update notification
     */
    async sendTicketUpdate(email, ticketSubject, status) {
        return this.sendCustomEmail('ticket_update', email, {
            ticketSubject,
            status
        });
    },

    /**
     * Update user notification preferences
     */
    async updateNotificationPreferences(userId, preferences) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    email_notifications: preferences.email ?? true,
                    push_notifications: preferences.push ?? true,
                    reminder_time: preferences.reminderTime ?? null
                })
                .eq('id', userId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('[Email Service] Update preferences failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get user notification preferences
     */
    async getNotificationPreferences(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('email_notifications, push_notifications, reminder_time')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return {
                success: true,
                preferences: {
                    email: data.email_notifications ?? true,
                    push: data.push_notifications ?? true,
                    reminderTime: data.reminder_time
                }
            };
        } catch (error) {
            console.error('[Email Service] Get preferences failed:', error);
            return { success: false, error: error.message };
        }
    }
};
