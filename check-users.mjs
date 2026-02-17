// Check which user_id belongs to which email
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhiwjerqyhtpienorzky.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
    console.log('\n=== CHECKING USER EMAILS ===\n');

    // Get all users with auth.users 
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.log('Error:', error.message);
        return;
    }

    users.forEach(user => {
        console.log(`${user.id.slice(0, 8)}... → ${user.email}`);
    });

    console.log('\n=== END ===\n');
}

checkUsers();
