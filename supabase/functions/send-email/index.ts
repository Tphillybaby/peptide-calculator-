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
