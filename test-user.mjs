// Test what a specific user sees
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhiwjerqyhtpienorzky.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Your user ID
const TREVOR_USER_ID = 'f2d234b8-';  // We'll find the full ID

async function testUserAccess() {
    console.log('\n=== TESTING USER-SPECIFIC ACCESS ===\n');

    // Get Trevor's full user ID
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const trevor = users.find(u => u.email === 'trevor.keller9@yahoo.com');

    if (!trevor) {
        console.log('❌ User not found');
        return;
    }

    console.log('Your user ID:', trevor.id);
    console.log('Your email:', trevor.email);

    // Check what injections exist for your user_id
    const { data: yourInjections } = await supabase
        .from('injections')
        .select('*')
        .eq('user_id', trevor.id);

    console.log('\n📊 Injections with YOUR user_id:', yourInjections?.length || 0);

    // Check what inventory exists for your user_id
    const { data: yourInventory } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', trevor.id);

    console.log('📦 Inventory with YOUR user_id:', yourInventory?.length || 0);

    // Now create a client that acts as Trevor
    // We need to impersonate the user
    console.log('\n--- Testing RLS as YOUR user ---');

    // Generate a session for Trevor
    const { data: session, error: sessionErr } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: trevor.email,
    });

    if (sessionErr) {
        console.log('Cannot generate session:', sessionErr.message);
    }

    // Alternative: Use the anon key and see what happens with no auth
    const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaXdqZXJxeWh0cGllbm9yemt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODU1MDEsImV4cCI6MjA3OTc2MTUwMX0.F4vRdN3qeH2ONDxoIgchW3Pn21KsGAWavwdnD3zkxhI');

    const { data: anonInjections, error } = await anonClient
        .from('injections')
        .select('id, peptide_name, user_id')
        .limit(10);

    if (error) {
        console.log('Anon client error:', error.message);
    } else {
        console.log('Anon client sees:', anonInjections?.length, 'injections');
        if (anonInjections?.length > 0) {
            console.log('⚠️  WARNING: Anon sees data when it should not!');
            anonInjections.forEach(i => console.log(`  - ${i.peptide_name} (user: ${i.user_id.slice(0, 8)}...)`));
        }
    }

    console.log('\n=== END ===\n');
}

testUserAccess();
