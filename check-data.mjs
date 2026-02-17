// Quick script to check database data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhiwjerqyhtpienorzky.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
    console.log('\n❌ Need SUPABASE_SERVICE_KEY environment variable');
    console.log('\nTo get it:');
    console.log('1. Go to: https://supabase.com/dashboard/project/nhiwjerqyhtpienorzky/settings/api');
    console.log('2. Copy the "service_role" key (NOT the anon key)');
    console.log('3. Run: SUPABASE_SERVICE_KEY="your-key" node check-data.mjs\n');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
    console.log('\n=== CHECKING DATABASE DATA ===\n');

    // Check injections
    const { data: injections, error: injErr } = await supabase
        .from('injections')
        .select('id, peptide_name, injection_date, user_id')
        .order('injection_date', { ascending: false })
        .limit(20);

    if (injErr) {
        console.log('Error fetching injections:', injErr.message);
    } else {
        console.log(`📊 Total recent injections: ${injections.length}`);
        if (injections.length > 0) {
            console.log('\nRecent injections:');
            injections.forEach((inj, i) => {
                console.log(`  ${i + 1}. ${inj.peptide_name} - ${new Date(inj.injection_date).toLocaleDateString()} (user: ${inj.user_id.slice(0, 8)}...)`);
            });
        }
    }

    // Check inventory
    const { data: inventory, error: invErr } = await supabase
        .from('inventory')
        .select('id, peptide_name, remaining_mg, user_id')
        .order('created_at', { ascending: false })
        .limit(20);

    if (invErr) {
        console.log('\nError fetching inventory:', invErr.message);
    } else {
        console.log(`\n📦 Total inventory items: ${inventory.length}`);
        if (inventory.length > 0) {
            console.log('\nInventory items:');
            inventory.forEach((item, i) => {
                console.log(`  ${i + 1}. ${item.peptide_name} - ${item.remaining_mg}mg (user: ${item.user_id.slice(0, 8)}...)`);
            });
        }
    }

    // Count by user
    const { data: userCounts } = await supabase
        .from('injections')
        .select('user_id');

    if (userCounts) {
        const counts = {};
        userCounts.forEach(row => {
            counts[row.user_id] = (counts[row.user_id] || 0) + 1;
        });
        console.log('\n👥 Injections per user:');
        Object.entries(counts).forEach(([uid, count]) => {
            console.log(`  ${uid.slice(0, 8)}... : ${count} injections`);
        });
    }

    console.log('\n=== END ===\n');
}

checkData();
