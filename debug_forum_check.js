
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhiwjerqyhtpienorzky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaXdqZXJxeWh0cGllbm9yemt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODU1MDEsImV4cCI6MjA3OTc2MTUwMX0.F4vRdN3qeH2ONDxoIgchW3Pn21KsGAWavwdnD3zkxhI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkForum() {
    console.log('Checking forum_categories...');
    try {
        const { data, error } = await supabase.from('forum_categories').select('*').order('sort_order');
        if (error) throw error;
        console.log('Categories OK:', data.length);
    } catch (e) {
        console.error('Categories ERROR:', e);
    }

    console.log('Checking recent topics (view)...');
    try {
        const { data: recent, error: recentError } = await supabase
            .from('forum_topics_with_profiles')
            .select('*')
            .limit(10);

        if (recentError) {
            console.error('Recent Topics View ERROR:', recentError);
            console.log('Trying fallback...');
            const { data: fallback, error: fbError } = await supabase
                .from('forum_topics')
                .select('*')
                .limit(10);
            if (fbError) console.error('Fallback ERROR:', fbError);
            else console.log('Fallback OK:', fallback.length);
        } else {
            console.log('Recent Topics View OK:', recent.length);
        }
    } catch (e) {
        console.error('Recent Topics EXCEPTION:', e);
    }

    console.log('Checking stats...');
    try {
        const { count: topicCount, error: tError } = await supabase
            .from('forum_topics')
            .select('*', { count: 'exact', head: true });
        if (tError) console.error('Topic Stats ERROR:', tError);
        else console.log('Topic Count:', topicCount);

        const { count: postCount, error: pError } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact', head: true });
        if (pError) console.error('Post Stats ERROR:', pError);
        else console.log('Post Count:', postCount);
    } catch (e) {
        console.error('Stats EXCEPTION:', e);
    }
}

checkForum();
