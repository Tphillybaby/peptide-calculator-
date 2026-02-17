// Check RLS status and test as a specific user
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhiwjerqyhtpienorzky.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLS() {
    console.log('\n=== CHECKING RLS STATUS ===\n');

    // Check if RLS is enabled on tables
    const { data: rlsStatus, error: rlsErr } = await supabase.rpc('exec_sql', {
        sql: `
            SELECT tablename, rowsecurity 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('injections', 'inventory', 'schedules');
        `
    });

    if (rlsErr) {
        console.log('Cannot check RLS via RPC, trying direct query...');

        // Try a different approach - query as the user's anon key
        const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaXdqZXJxeWh0cGllbm9yemt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODU1MDEsImV4cCI6MjA3OTc2MTUwMX0.F4vRdN3qeH2ONDxoIgchW3Pn21KsGAWavwdnD3zkxhI');

        console.log('Testing anonymous access (no auth):');
        const { data: anonData, error: anonErr } = await anonClient
            .from('injections')
            .select('id, peptide_name')
            .limit(5);

        if (anonErr) {
            console.log('  ✅ Anonymous query blocked:', anonErr.message);
        } else {
            console.log('  ❌ Anonymous got data:', anonData?.length, 'rows');
            if (anonData?.length > 0) {
                console.log('  Data:', anonData);
            }
        }
    } else {
        console.log('RLS Status:', rlsStatus);
    }

    // Check policies
    console.log('\n--- Checking via service role (bypasses RLS) ---');
    const { data: policies } = await supabase
        .from('injections')
        .select('id, peptide_name, user_id')
        .limit(3);
    console.log('Service role sees:', policies?.length || 0, 'rows (expected: all data)');

    console.log('\n=== END ===\n');
}

checkRLS();
