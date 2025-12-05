// This is a client-side mock of an email service.
// In a real production app, this would call a Supabase Edge Function
// which would then use an SMTP provider like Resend, SendGrid, or AWS SES.

export const emailService = {
    sendWelcomeEmail: async (email, name) => {
        console.log(`[Email Service] Sending Welcome Email to ${email}`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    },

    sendPasswordReset: async (email) => {
        console.log(`[Email Service] Sending Password Reset to ${email}`);
        // Supabase Auth handles this natively, but this could trigger a custom template
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    },

    sendTestReminder: async (email) => {
        console.log(`[Email Service] Sending Test Reminder to ${email}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, message: 'Test email sent (simulated)' };
    },

    updatePreferences: async (userId, preferences) => {
        console.log(`[Email Service] Updating preferences for ${userId}`, preferences);
        // This would update a 'user_settings' table in Supabase
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
    }
};
