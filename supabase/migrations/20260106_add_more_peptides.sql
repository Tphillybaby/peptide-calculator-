-- Additional peptides to expand the database
-- Run this in Supabase SQL Editor

INSERT INTO public.peptides (name, category, half_life_hours, description, benefits, side_effects, warnings, dosage_protocols)
VALUES
-- Growth Hormone Peptides
(
    'Sermorelin',
    'Growth Hormone Releasing Hormone',
    10,
    'A bioidentical GHRH analog that stimulates natural growth hormone release from the pituitary.',
    ARRAY['Stimulates natural GH production','Improved sleep quality','Enhanced recovery','Fat loss support','Increased energy','Skin and hair improvements','Anti-aging benefits','Safer than exogenous GH'],
    ARRAY['Injection site reactions','Headache','Flushing','Dizziness','Hyperactivity'],
    ARRAY['Monitor IGF-1 levels','Not for active cancer','May affect glucose metabolism','Consult doctor if diabetic'],
    '[{"name":"Standard Protocol","level":"Beginner","description":"Typical dosing for anti-aging","schedule":[{"week":"1-4","dose":"100-200mcg","frequency":"Before bed","notes":"Start low"},{"week":"5+","dose":"200-300mcg","frequency":"Before bed","notes":"Adjust based on response"}],"duration":"3-6 months","notes":"Best taken on empty stomach before sleep."}]'
),
(
    'Tesamorelin',
    'Growth Hormone Releasing Hormone',
    38,
    'FDA-approved GHRH analog specifically studied for reducing visceral adiposity in HIV patients.',
    ARRAY['Reduces visceral fat','FDA-approved for lipodystrophy','Increases GH and IGF-1','Improves body composition','May improve cognitive function'],
    ARRAY['Injection site reactions','Joint pain','Muscle pain','Peripheral edema','Paresthesia'],
    ARRAY['Monitor glucose levels','May worsen diabetic retinopathy','Not for active malignancy','Pregnancy category X'],
    '[]'
),
(
    'Hexarelin',
    'Growth Hormone Secretagogue',
    1,
    'A potent synthetic hexapeptide GH secretagogue that also has cardioprotective properties.',
    ARRAY['Potent GH release','Cardioprotective effects','Cytoprotective properties','Enhanced recovery','Muscle growth support'],
    ARRAY['Increased hunger','Water retention','Cortisol elevation','Prolactin elevation','Numbness/tingling'],
    ARRAY['Monitor cortisol and prolactin','Avoid with active cancer','Receptor desensitization possible with chronic use'],
    '[]'
),
(
    'GHRP-2',
    'Growth Hormone Releasing Peptide',
    0.5,
    'A synthetic hexapeptide that stimulates GH release with moderate hunger increase.',
    ARRAY['Strong GH release','Fat loss support','Improved recovery','Better sleep','Increased appetite (can be beneficial)'],
    ARRAY['Increased appetite','Water retention','Cortisol elevation','Prolactin increase','Tingling/numbness'],
    ARRAY['Monitor hormone levels','May affect blood sugar','Avoid with active malignancy','Best used with GHRH for synergy'],
    '[]'
),
(
    'GHRP-6',
    'Growth Hormone Releasing Peptide',
    0.5,
    'A hexapeptide GH secretagogue known for strong appetite stimulation alongside GH release.',
    ARRAY['Strong GH release','Significant appetite increase','Muscle growth support','Enhanced recovery','Joint and tendon support'],
    ARRAY['Significant hunger increase','Water retention','Cortisol increase','Prolactin elevation','Lethargy'],
    ARRAY['May cause unwanted weight gain from appetite','Monitor hormones','Not for those needing appetite suppression'],
    '[]'
),

-- Healing & Recovery Peptides
(
    'Pentadecapeptide BPC-157 Arginate',
    'Healing Peptide',
    4,
    'Arginine salt form of BPC-157 with improved stability and potentially enhanced bioavailability.',
    ARRAY['Enhanced stability over acetate form','All BPC-157 benefits','Gut healing','Tendon and ligament repair','Reduced inflammation','Neuroprotective'],
    ARRAY['Same as BPC-157','Generally well-tolerated','Rare nausea or dizziness'],
    ARRAY['Limited human trials','Long-term safety unknown','Consult healthcare provider'],
    '[]'
),
(
    'TB-4 FRAG (Ac-SDKP)',
    'Healing Peptide',
    0.5,
    'A tetrapeptide fragment of Thymosin Beta-4 with antifibrotic and regenerative properties.',
    ARRAY['Antifibrotic effects','Cardiac protection researched','Anti-inflammatory','May support stem cell differentiation'],
    ARRAY['Limited side effect data','Injection site irritation'],
    ARRAY['Research compound','Limited human data','Medical supervision recommended'],
    '[]'
),
(
    'Pentosan Polysulfate (PPS)',
    'Joint Health',
    24,
    'A semi-synthetic polysulfated xylan used for joint health and interstitial cystitis.',
    ARRAY['Chondroprotective effects','FDA-approved for IC','May improve joint lubrication','Reduces cartilage degradation'],
    ARRAY['GI upset','Headache','Dizziness','Hair thinning (rare)','Bleeding risk'],
    ARRAY['Affects blood clotting','Recent maculopathy warning','Regular eye exams recommended with long-term use'],
    '[]'
),

-- Metabolic Peptides
(
    '5-Amino-1MQ',
    'Metabolic & Fat Loss',
    6,
    'A small molecule that inhibits NNMT enzyme, potentially promoting fat loss and metabolic health.',
    ARRAY['May reduce fat accumulation','Oral bioavailability','Supports metabolic health','No hormonal effects','Energy improvement'],
    ARRAY['Limited human data','Mild GI effects reported','Headache'],
    ARRAY['Research compound','Long-term safety unknown','Avoid in pregnancy'],
    '[]'
),
(
    'Tesofensine',
    'Metabolic & Fat Loss',
    220,
    'A triple monoamine reuptake inhibitor studied for obesity with significant weight loss effects.',
    ARRAY['Significant weight loss in trials','Appetite suppression','May improve mood','Oral dosing'],
    ARRAY['Dry mouth','Insomnia','Increased heart rate','Constipation','Mood changes'],
    ARRAY['Cardiovascular monitoring required','Not for uncontrolled hypertension','May cause dependency','Psychiatric monitoring advised'],
    '[]'
),

-- Anti-Aging & Longevity
(
    'Epitalon (Epithalon)',
    'Longevity & Telomerase',
    20,
    'Synthetic tetrapeptide studied for telomerase activation and potential anti-aging effects.',
    ARRAY['Potential telomerase activation','Sleep quality improvement','Antioxidant activity','Melatonin regulation','Possible lifespan extension (animal data)'],
    ARRAY['Generally well-tolerated','Injection site reactions','Vivid dreams'],
    ARRAY['Limited human data','Long-term effects unknown','Use under medical guidance'],
    '[{"name":"Standard Protocol","level":"Intermediate","description":"Typical cycling approach","schedule":[{"week":"1-2","dose":"5-10mg","frequency":"Daily","notes":"Loading phase"}],"duration":"10-20 days, repeat every 4-6 months","notes":"Typically cycled rather than continuous use."}]'
),
(
    'GHK (Basic Form)',
    'Healing & Anti-Aging',
    0.5,
    'The tripeptide backbone of GHK-Cu, studied for wound healing and gene regulation.',
    ARRAY['Wound healing','Gene expression modulation','Works independently of copper','Collagen synthesis support'],
    ARRAY['Mild injection site reactions','Generally well-tolerated'],
    ARRAY['Less studied than GHK-Cu','Use quality-assured sources'],
    '[]'
),
(
    'Humanin',
    'Longevity & Neuroprotection',
    2,
    'A mitochondrial-derived peptide with cytoprotective and anti-apoptotic properties.',
    ARRAY['Neuroprotective effects','Anti-apoptotic','May protect against beta-amyloid toxicity','Cardioprotective potential'],
    ARRAY['Limited human data','Unknown long-term effects'],
    ARRAY['Research-stage peptide','Use only under medical supervision'],
    '[]'
),

-- Immune & Antimicrobial
(
    'LL-37',
    'Antimicrobial Peptide',
    2,
    'Human cathelicidin antimicrobial peptide with broad-spectrum antimicrobial and immunomodulatory effects.',
    ARRAY['Broad antimicrobial activity','Immunomodulation','Wound healing support','Biofilm disruption','Anti-inflammatory effects'],
    ARRAY['Injection site reactions','Potential autoimmune considerations at high doses'],
    ARRAY['Potent immune effects—use with caution in autoimmune conditions','Research compound'],
    '[]'
),
(
    'Thymalin',
    'Immune Modulator',
    2,
    'Bovine thymus extract peptides used in some regions for immune support.',
    ARRAY['Immune system support','May improve T-cell function','Used in post-infection recovery','Thymus regeneration support'],
    ARRAY['Injection site reactions','Allergic reactions possible'],
    ARRAY['Animal-derived—allergy risk','Quality control important','Use medical supervision'],
    '[]'
),

-- Skin & Cosmetic
(
    'Argireline (Acetyl Hexapeptide-3)',
    'Cosmetic Peptide',
    6,
    'Topical hexapeptide marketed as a Botox alternative for reducing expression lines.',
    ARRAY['Reduces appearance of wrinkles','Non-invasive alternative to Botox','Topical application','Targets expression lines'],
    ARRAY['Skin irritation (rare)','Limited efficacy compared to injections'],
    ARRAY['Cosmetic use only','Results vary widely','Not a replacement for professional treatments'],
    '[]'
),
(
    'Matrixyl (Palmitoyl Pentapeptide-4)',
    'Cosmetic Peptide',
    6,
    'A lipopeptide that stimulates collagen and fibronectin production in skin.',
    ARRAY['Stimulates collagen synthesis','Reduces wrinkle depth','Improves skin texture','Well-studied in cosmetics'],
    ARRAY['Possible skin irritation','Allergic reactions rare'],
    ARRAY['Topical use only','Combine with sunscreen for best results'],
    '[]'
),
(
    'Leuphasyl',
    'Cosmetic Peptide',
    6,
    'Pentapeptide that works synergistically with Argireline to reduce expression wrinkles.',
    ARRAY['Enhances Argireline effects','Reduces muscle contraction signaling','Non-invasive wrinkle reduction'],
    ARRAY['Skin sensitivity possible','Limited side effect data'],
    ARRAY['Topical cosmetic use','Best combined with other peptides'],
    '[]'
),

-- Sexual Health
(
    'Kisspeptin-10',
    'Reproductive Hormone',
    0.5,
    'A peptide that stimulates GnRH release, researched for reproductive and metabolic effects.',
    ARRAY['Stimulates LH and FSH release','Potential fertility support','Research in metabolic regulation','May improve testosterone in men'],
    ARRAY['Hot flashes','Injection site reactions','Transient hormone fluctuations'],
    ARRAY['Powerful hormonal effects','Use only under endocrinologist supervision','Not for pregnant women'],
    '[]'
),
(
    'Gonadorelin',
    'Reproductive Hormone',
    0.5,
    'Synthetic GnRH used to stimulate or test pituitary function.',
    ARRAY['Stimulates natural LH/FSH production','Used in fertility protocols','Can maintain testicular function during TRT','Diagnostic uses'],
    ARRAY['Injection site reactions','Headache','Nausea','Flushing'],
    ARRAY['Timing-dependent effects','Pulsatile vs continuous dosing matters','Medical supervision required'],
    '[]'
),

-- Pain & Inflammation
(
    'Dihexa',
    'Cognitive & Neuroprotection',
    2,
    'A potent HGF mimetic studied for cognitive enhancement and neuroprotection.',
    ARRAY['Potent nootropic effects (animal data)','May enhance synaptogenesis','Neuroprotective potential','Oral bioavailability'],
    ARRAY['Limited human safety data','Potential for unknown long-term effects'],
    ARRAY['Very potent—use extreme caution with dosing','Cancer risk theoretical due to HGF pathway','Research compound only'],
    '[]'
),
(
    'Palmitoylethanolamide (PEA)',
    'Pain & Inflammation',
    4,
    'An endogenous fatty acid amide with analgesic and anti-inflammatory properties.',
    ARRAY['Reduces chronic pain','Anti-inflammatory','Neuroprotective','Well-tolerated','Oral availability','No psychoactive effects'],
    ARRAY['Mild GI upset rare','Generally very well-tolerated'],
    ARRAY['May interact with other anti-inflammatories','Safe profile but consult for drug interactions'],
    '[]'
),

-- Tanning & Pigmentation
(
    'Melanotan I (Afamelanotide)',
    'Melanocortin Agonist',
    0.5,
    'A longer-acting alpha-MSH analog studied for skin protection in EPP patients.',
    ARRAY['FDA-approved for EPP','Skin darkening/tanning','Photoprotection','Longer duration than MT-II'],
    ARRAY['Nausea','Facial flushing','Headache','Fatigue'],
    ARRAY['Darkens moles—monitor for changes','Not approved for cosmetic tanning','Medical supervision required'],
    '[]'
),

-- Muscle & Performance
(
    'IGF-1 LR3',
    'Growth Factor',
    20,
    'A modified IGF-1 with extended half-life for enhanced muscle and recovery effects.',
    ARRAY['Potent muscle growth','Extended half-life vs native IGF-1','Enhanced recovery','Hyperplasia potential','Fat loss support'],
    ARRAY['Hypoglycemia risk','Joint pain','Organ growth concerns','Water retention','Potential tumor promotion'],
    ARRAY['Powerful growth factor—use with extreme caution','May promote cancer growth','Blood glucose monitoring essential','Not for diabetics without supervision'],
    '[]'
),
(
    'IGF-1 DES',
    'Growth Factor',
    0.5,
    'Truncated IGF-1 with very short half-life and potent local effects.',
    ARRAY['Highly potent at injection site','Short action for targeted effects','Muscle hyperplasia potential'],
    ARRAY['Hypoglycemia','Localized pain','Systemic effects less than LR3'],
    ARRAY['Very potent—precise dosing critical','Same cancer/growth concerns as IGF-1','Research compound'],
    '[]'
),
(
    'MGF (Mechano Growth Factor)',
    'Growth Factor',
    0.5,
    'A splice variant of IGF-1 activated by mechanical stress, involved in muscle repair.',
    ARRAY['Stimulates satellite cells','Muscle repair and growth','Local action when injected','Synergistic with resistance training'],
    ARRAY['Short half-life requires precise timing','Injection site soreness'],
    ARRAY['Highly localized effect—must inject into target muscle','Research compound','Monitor for systemic effects'],
    '[]'
),
(
    'PEG-MGF',
    'Growth Factor',
    24,
    'Pegylated MGF with extended half-life allowing systemic distribution.',
    ARRAY['Longer half-life than MGF','Systemic muscle support','Less frequent dosing','Recovery enhancement'],
    ARRAY['Injection site reactions','Unknown long-term effects','Possible immune response to PEG'],
    ARRAY['PEGylation may cause immune reactions','Limited human data','Research compound'],
    '[]'
),

-- Sleep & Circadian
(
    'DSIP (Delta Sleep-Inducing Peptide)',
    'Sleep & Recovery',
    0.5,
    'A neuropeptide studied for promoting delta wave sleep and stress reduction.',
    ARRAY['May improve sleep quality','Stress reduction potential','Possible pain modulation','LH release support'],
    ARRAY['Paradoxical insomnia in some','Headache','Morning grogginess'],
    ARRAY['Variable response among users','Limited clinical data','Avoid combining with sedatives'],
    '[]'
),

-- Cardiovascular
(
    'Thymosin Beta-4 Fragment (TB-4 Frag)',
    'Cardiovascular',
    0.5,
    'Active fragment of TB-500 with focused cardiac and vascular protective effects.',
    ARRAY['Cardioprotective','Antifibrotic','Wound healing','Smaller molecule than full TB-500'],
    ARRAY['Injection site reactions','Limited side effect profile known'],
    ARRAY['Research compound','Use under medical supervision'],
    '[]'
),

-- Weight Loss Combination
(
    'Semaglutide/B12 Compound',
    'GLP-1 Agonist',
    168,
    'Compounded combination of Semaglutide with B12 for enhanced metabolic support.',
    ARRAY['All semaglutide benefits','Additional B12 energy support','May reduce injection frequency','Common in weight loss clinics'],
    ARRAY['Same as semaglutide','B12 injection site reactions'],
    ARRAY['Compounding quality varies','Same contraindications as semaglutide'],
    '[]'
)
ON CONFLICT (name) DO UPDATE SET
category = EXCLUDED.category,
half_life_hours = EXCLUDED.half_life_hours,
description = EXCLUDED.description,
benefits = EXCLUDED.benefits,
side_effects = EXCLUDED.side_effects,
warnings = EXCLUDED.warnings,
dosage_protocols = EXCLUDED.dosage_protocols;

-- Add unique constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'peptides_name_key'
    ) THEN
        ALTER TABLE public.peptides ADD CONSTRAINT peptides_name_key UNIQUE (name);
    END IF;
END $$;
