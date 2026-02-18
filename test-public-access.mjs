
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhiwjerqyhtpienorzky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaXdqZXJxeWh0cGllbm9yemt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODU1MDEsImV4cCI6MjA3OTc2MTUwMX0.F4vRdN3qeH2ONDxoIgchW3Pn21KsGAWavwdnD3zkxhI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPublicAccess() {
    console.log('--- Testing Public (Anonymous) Access ---');
    try {
        const { data, error } = await supabase
            .from('injections')
            .select('*')
            .limit(5);

        if (error) {
            console.log('✅ Query blocked/error:', error.message);
        } else {
            console.log(`❌ Query succeeded. Rows returned: ${data.length}`);
            if (data.length > 0) {
                console.log('First row:', data[0]);
                console.log('User ID in row:', data[0].user_id);
            } else {
                console.log('✅ Query returned 0 rows (RLS likely working for public)');
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkPublicAccess();
