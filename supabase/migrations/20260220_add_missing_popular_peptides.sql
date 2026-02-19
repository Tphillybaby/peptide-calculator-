-- Adding more peptides including MT1, LIPO-C, and others

INSERT INTO public.peptides (name, category, half_life_hours, description, benefits, side_effects, warnings, dosage_protocols)
VALUES
-- Melanotan 1 (MT1)
(
    'Melanotan 1 (Afamelanotide)',
    'Melanocortin Agonist',
    1,
    'Synthetic analogue of alpha-MSH that induces skin tanning with fewer side effects than MT2.',
    ARRAY['Induces skin tanning', 'Photoprotection against UV damage', 'Potential treatment for EPP', 'Less nausea than MT2', 'Lower risk of spontaneous erections than MT2'],
    ARRAY['Facial flushing', 'Nausea (mild)', 'Fatigue', 'Increased mole darkness'],
    ARRAY['Monitor moles for changes', 'Start with low dose to assess tolerance', 'UV exposure required for best results'],
    '[{"condition": "Tanning", "dosage": "1-2mg", "frequency": "Daily until desired tan, then 1-2x/week maintenance", "duration": "Variable"}]'
),

-- LIPO-C (MIC + B12 like blend often used) - NOTE: LIPO-C is often a blend, but represented here as a singular entry for tracking
(
    'LIPO-C (Lipotropic Injection)',
    'Fat Loss / Metabolic',
    24, -- Variable effectively
    'Combination of Methionine, Inositol, Choline, and Carnitine often used to support fat metabolism.',
    ARRAY['Supports fat metabolism', 'Liver health support', 'Energy boost', 'May aid weight loss efforts'],
    ARRAY['Injection site irritation', 'Mild nausea', 'Upset stomach'],
    ARRAY['Often sold as a compounded blend', 'Ensure quality source'],
    '[{"condition": "Fat Loss Support", "dosage": "1-2ml", "frequency": "1-2 times weekly", "duration": "Ongoing"}]'
),

-- MOTS-c
(
    'MOTS-c',
    'Mitochondrial Peptide',
    0.5, -- Rapidly degraded but effects long lasting via gene expression
    'Mitochondrial-derived peptide that regulates metabolic functions and mimics exercise effects.',
    ARRAY['Enhances insulin sensitivity', 'Promotes fatty acid oxidation', 'Improves physical performance', 'Anti-aging metabolic effects', 'Mitochondrial biogenesis'],
    ARRAY['Injection site pain (common)', 'Flu-like symptoms upon initiation', 'Potential for low blood sugar'],
    ARRAY['Often painful injection - warm before use', 'Monitor blood glucose'],
    '[{"condition": "Metabolic Optimization", "dosage": "5-10mg", "frequency": "Weekly", "notes": "Monitor glucose levels."}]'
),

-- Humanin
(
    'Humanin',
    'Mitochondrial Peptide',
    4,
    'Mitochondrial peptide with cytoprotective, anti-aging, and neuroprotective properties.',
    ARRAY['Cytoprotection', 'Neuroprotection against Alzheimer''s pathology', 'Improves insulin sensitivity', 'Anti-inflammatory', 'Cardioprotection'],
    ARRAY['Limited human data', 'Injection site reactions'],
    ARRAY['Research compound', 'Limited clinical protocols'],
    '[{"condition": "Anti-Aging/Neuroprotection", "dosage": "Consult research literature", "frequency": "Variable", "duration": "Variable"}]'
),

-- Epithalon (Epitalon)
(
    'Epithalon',
    'Anti-Aging / Longevity',
    0.5,
    'Synthetic peptide that increases telomerase activity and may extend lifespan.',
    ARRAY['Increases telomere length in studies', 'Normalizes circadian rhythm', 'Improves sleep quality', 'Antioxidant effects', 'Potential lifespan extension'],
    ARRAY['None reported in significant frequency', 'Mild fatigue'],
    ARRAY['Often cycled (e.g., 2 weeks on, months off)', 'Research compound'],
    '[{"condition": "Anti-Aging Protocol", "dosage": "5-10mg", "frequency": "Daily", "duration": "10-20 days, repeat every 6 months"}]'
),

-- Thymalin
(
    'Thymalin',
    'Immune Modulator',
    2,
    'Thymus-derived peptide bioregulator that supports immune function.',
    ARRAY['Immune system regulation', 'Enhances T-cell function', 'Used in Russia for various immune conditions', 'Synergistic with Epithalon'],
    ARRAY['None reported significant', 'Possible mild immune activation symptoms'],
    ARRAY['Often used in combination with Epithalon', 'Research compound'],
    '[{"condition": "Immune Support", "dosage": "10mg", "frequency": "Daily", "duration": "10 days, repeat every 6 months"}]'
),

-- Pinealon
(
    'Pinealon',
    'Nootropic / Bioregulator',
    2,
    'Synthetic peptide bioregulator for the brain and central nervous system.',
    ARRAY['Improves cognitive function', 'Neuroprotection', 'Reduces oxidative stress in brain', 'Supports memory and focus'],
    ARRAY['No significant side effects reported'],
    ARRAY['Research compound'],
    '[{"condition": "Cognitive Support", "dosage": "Short course", "frequency": "Daily", "duration": "10-20 days"}]'
),

-- Vesugen
(
    'Vesugen',
    'Cardiovascular / Bioregulator',
    2,
    'Synthetic peptide bioregulator for the vascular system.',
    ARRAY['Improves blood vessel elasticity', 'Supporting circulation', 'Atherosclerosis prevention support'],
    ARRAY['No significant side effects reported'],
    ARRAY['Research compound'],
    '[{"condition": "Vascular Health", "dosage": "Short course", "frequency": "Daily", "duration": "10-20 days"}]'
),

-- Cartalax
(
    'Cartalax',
    'Joint / Bioregulator',
    2,
    'Synthetic peptide bioregulator for cartilage and connective tissue.',
    ARRAY['Supports cartilage repair', 'Joint health', 'Connective tissue regeneration', 'Osteoarthritis support'],
    ARRAY['No significant side effects reported'],
    ARRAY['Research compound'],
    '[{"condition": "Joint Support", "dosage": "Short course", "frequency": "Daily", "duration": "10-20 days"}]'
),

-- 5-Amino-1MQ
(
    '5-Amino-1MQ',
    'Metabolic / Fat Loss',
    6,
    'Small molecule (not strictly a peptide but often grouped) that inhibits NNMT enzyme to boost metabolism.',
    ARRAY['Increases metabolic rate', 'Fat loss support', 'Muscle preservation', 'Not a stimulant', 'Increases NAD+ levels'],
    ARRAY['Sleep disturbance if taken late', 'Headache'],
    ARRAY['Oral bioavailability is good', 'Monitor for side effects'],
    '[{"condition": "Fat Loss", "dosage": "50-150mg", "frequency": "Daily (Oral)", "duration": "Variable"}]'
),

-- ARA-290
(
    'ARA-290 (Cibinetide)',
    'Anti-Inflammatory / Neuro',
    0.5,
    'Non-hematopoietic EPO derivative designed for neuropathic pain and inflammation.',
    ARRAY['Neuropathic pain relief', 'Small fiber neuropathy repair', 'Anti-inflammatory', 'Does not increase red blood cells'],
    ARRAY['Injection site reactions', 'Mild headache'],
    ARRAY['Short half-life requiring frequent dosing often'],
    '[{"condition": "Neuropathy", "dosage": "4mg", "frequency": "Daily", "duration": "Variable"}]'
),

-- GHK-Cu (Adding more specific detail/variant if needed, but existing GHK-Cu is usually sufficient. 
-- However, GHK-Basic is sometimes requested. Sticking to new ones.)

-- Hexarelin
(
    'Hexarelin',
    'Growth Hormone Secretagogue',
    0.5,
    'Potent GHRP similar to GHRP-6 but stronger and with minimal appetite stimulation.',
    ARRAY['Potent GH release', 'Cardioprotective effects', 'Muscle growth support', 'Fat loss'],
    ARRAY['Desensitization with long-term use', 'Increased cortisol/prolactin (mild)', 'Water retention'],
    ARRAY['Cycle to avoid desensitization'],
    '[{"condition": "GH Release", "dosage": "100-200mcg", "frequency": "1-3 times daily", "duration": "Cycles recommended"}]'
),

-- Tesofensine
(
    'Tesofensine',
    'Weight Loss (SNDRI)',
    220, -- Long half life (~9 days)
    'Triple reuptake inhibitor (not a peptide, small molecule) often grouped with research compounds for extreme weight loss.',
    ARRAY['Potent appetite suppression', 'Significant weight loss', 'Metabolic boost'],
    ARRAY['Insomnia', 'Dry mouth', 'Heart rate increase', 'Anxiety', 'Blood pressure elevation'],
    ARRAY['Monitor heart rate and BP closely', 'Start low dose'],
    '[{"condition": "Weight Loss", "dosage": "0.25-0.5mg", "frequency": "Daily", "duration": "Variable"}]'
)

ON CONFLICT (name) DO UPDATE SET
category = EXCLUDED.category,
half_life_hours = EXCLUDED.half_life_hours,
description = EXCLUDED.description,
benefits = EXCLUDED.benefits,
side_effects = EXCLUDED.side_effects,
warnings = EXCLUDED.warnings,
dosage_protocols = EXCLUDED.dosage_protocols;
