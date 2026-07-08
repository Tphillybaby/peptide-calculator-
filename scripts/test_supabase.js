import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    // Check total count
    const { count } = await supabase
        .from('peptides')
        .select('*', { count: 'exact', head: true });
    console.log(`Total peptides in database: ${count}`);

    // Check specific new ones
    const newNames = [
        'VK2735', 'Amycretin', 'Danuglipron', 'Tirzepatide/B12 Compound',
        'CJC-1295 + Ipamorelin Blend', 'Tesamorelin + Ipamorelin Stack',
        'BPC-157 + KPV + GHK-Cu Stack', 'Semax + Selank Stack',
        'MOTS-c + SS-31 Stack', 'Thymalin + Epithalon Stack',
        'Semaglutide + BPC-157 Stack', 'LL-37 + GHK-Cu Stack',
        'Palmitoyl Oligopeptide', 'Klotho Peptide Fragment',
        'Humanin Analog (HNG)', 'Kisspeptin-54', 'Lonapegsomatropin (TransCon hGH)'
    ];
    const { data } = await supabase
        .from('peptides')
        .select('name, dosage_protocols')
        .in('name', [...newNames, 'IGF-1 LR3']);

    console.log('\nNew + updated peptides found:');
    data?.forEach(p => {
        const protos = Array.isArray(p.dosage_protocols) ? p.dosage_protocols.length : 0;
        console.log(`  ✅ ${p.name} (${protos} protocols)`);
    });

    const found = data?.map(p => p.name) || [];
    const missing = [...newNames].filter(n => !found.includes(n));
    if (missing.length) {
        console.log('\n⚠️  Not found:', missing);
    }
}
verify();
