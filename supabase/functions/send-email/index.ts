// Follow this setup guide to integrate the Deno runtime for Supabase Edge Functions:
// https://supabase.com/docs/guides/functions


// import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://peptidelog.net',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, type, data } = await req.json()

        if (!RESEND_API_KEY) {
            throw new Error('Missing RESEND_API_KEY environment variable')
        }

        let subject = ''
        let html = ''

        // Determine email content based on type
        switch (type) {
            case 'welcome':
                subject = 'Welcome to PeptideLog'
                html = `
          <h1>Welcome to PeptideLog!</h1>
          <p>Hi ${data.name || 'there'},</p>
          <p>Thanks for joining. We're here to help you track your protocols safely.</p>
        `
                break
            case 'injection_reminder':
                subject = 'Reminder: Upcoming Injection'
                const time = data.scheduledTime ? new Date(data.scheduledTime).toLocaleString() : 'Now';
                html = `
          <h1>Time for your injection</h1>
          <p>This is a reminder for your scheduled injection of <strong>${data.peptideName || 'Peptide'}</strong>.</p>
          <p>Scheduled time: ${time}</p>
          <a href="https://peptidelog.net/dashboard">Log Injection</a>
        `
                break
            case 'ticket_update':
                subject = `Update on ticket: ${data.ticketSubject}`
                html = `
          <h1>Support Ticket Updated</h1>
          <p>Your support ticket has been updated to status: <strong>${data.status}</strong>.</p>
          <p>Log in to view the response.</p>
        `
                break
            case 'test':
                subject = 'Test Email from PeptideLog'
                html = `
          <h1>It Works!</h1>
          <p>This is a test email sent from your Supabase Edge Function via Resend.</p>
        `
                break
            case 'reset_password':
                // Note: Supabase Auth handles this natively usually, but if custom:
                subject = 'Reset Your Password'
                html = `<p>Click <a href="${data.url}">here</a> to reset your password.</p>`
                break
            case 'contact_form':
                subject = `[Contact Form] ${data.subject || 'New Message'}`
                html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: #f8fafc; margin: 0; font-size: 20px;">📬 New Contact Form Submission</h1>
            </div>
            <div style="background: #1e293b; padding: 24px; border: 1px solid #334155;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 12px; color: #94a3b8; font-size: 14px; white-space: nowrap;">Name:</td>
                  <td style="padding: 8px 12px; color: #f8fafc; font-weight: 600;">${data.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #94a3b8; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 12px; color: #3b82f6;"><a href="mailto:${data.email}" style="color: #3b82f6;">${data.email || 'N/A'}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #94a3b8; font-size: 14px;">Category:</td>
                  <td style="padding: 8px 12px; color: #f8fafc;">${data.category || 'General'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #94a3b8; font-size: 14px;">Logged In:</td>
                  <td style="padding: 8px 12px; color: ${data.isLoggedIn ? '#10b981' : '#f59e0b'};">${data.isLoggedIn ? '✅ Yes' : '❌ Guest'}</td>
                </tr>
              </table>
              <hr style="border: none; border-top: 1px solid #334155; margin: 16px 0;" />
              <h3 style="color: #f8fafc; margin: 0 0 8px; font-size: 14px;">Subject:</h3>
              <p style="color: #e2e8f0; margin: 0 0 16px; font-size: 15px;">${data.subject}</p>
              <h3 style="color: #f8fafc; margin: 0 0 8px; font-size: 14px;">Message:</h3>
              <div style="background: #0f172a; padding: 16px; border-radius: 8px; border: 1px solid #334155;">
                <p style="color: #cbd5e1; margin: 0; white-space: pre-wrap; line-height: 1.6; font-size: 14px;">${data.message}</p>
              </div>
            </div>
            <div style="background: #0f172a; padding: 16px; border-radius: 0 0 12px 12px; border: 1px solid #334155; border-top: none; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">Reply directly to this email or view in <a href="https://peptidelog.net/admin/tickets" style="color: #3b82f6;">Admin Panel</a></p>
            </div>
          </div>
        `
                break
            default:
                throw new Error('Invalid email type')
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'PeptideLog <onboarding@resend.dev>', // Update this with your verified domain later
                to: [email],
                subject: subject,
                html: html,
            }),
        })

        const responseData = await res.json()

        if (!res.ok) {
            throw new Error(responseData.message || 'Failed to send email')
        }

        return new Response(
            JSON.stringify(responseData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
