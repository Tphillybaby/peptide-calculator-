-- ============================================================
-- Enrich NAD+ and Retatrutide encyclopedia entries
-- Added: 2026-04-13
-- ============================================================

UPDATE public.peptides SET
    category        = 'Cellular Energy & Anti-Aging',
    half_life_hours = 4,
    description     = 'NAD+ (Nicotinamide Adenine Dinucleotide) is a critical coenzyme present in every living cell. It is the central electron carrier in cellular respiration and a key substrate for sirtuins (longevity proteins), PARP enzymes (DNA repair), and CD38/cyclic-ADP-ribose signaling. NAD+ levels decline 40–50% between ages 20 and 60, driving many hallmarks of aging. Supplementation via IV infusion, subcutaneous injection, or oral precursors (NMN, NR) can restore levels and is being actively studied for longevity, neurological health, metabolic disease, and addiction recovery.',
    benefits        = ARRAY[
        'Boosts cellular ATP energy production (mitochondrial Complex I)',
        'Activates sirtuins (SIRT1–SIRT7) — key longevity regulators',
        'Enhances PARP-mediated DNA repair and genomic stability',
        'Improves mitochondrial biogenesis and function',
        'Increased mental clarity, focus, and cognitive performance',
        'Supports addiction and withdrawal recovery (alcohol, opioids)',
        'Reduces neuroinflammation and supports neuroprotection',
        'May improve insulin sensitivity and metabolic health',
        'Anti-aging effects via telomere maintenance support',
        'Chronic fatigue and Long COVID symptom relief (emerging data)',
        'Improves exercise performance and muscle recovery',
        'Supports circadian rhythm regulation'
    ],
    side_effects    = ARRAY[
        'Nausea (very common during IV — almost universal if infused too fast)',
        'Flushing and chest pressure/tightness (IV — rate-dependent)',
        'Cramping or abdominal discomfort (IV)',
        'Headache (IV and oral)',
        'Fatigue or "detox reaction" during first 1–3 days',
        'Dizziness or lightheadedness (IV)',
        'Mild injection site irritation (SubQ)',
        'Insomnia if dosed later in the day (stimulating effect)',
        'Transient elevation in liver enzymes (rare, high dose IV)'
    ],
    warnings        = ARRAY[
        'IV must be infused SLOWLY (100mg/hr max) — rapid infusion causes severe chest tightness',
        'Medical supervision strongly recommended for IV therapy',
        'May interact with certain chemotherapy drugs (PARP inhibitors)',
        'May lower blood pressure — caution with antihypertensives',
        'Monitor liver enzymes on prolonged high-dose protocols',
        'CD38 inhibition by NAD+ precursors may affect immune function',
        'Avoid late-evening dosing — activates SIRT1 and can disrupt sleep',
        'Those with active cancer should consult oncologist before use'
    ],
    dosage_protocols = '[
        {
            "name": "IV Loading Protocol (Clinical)",
            "level": "Advanced",
            "description": "High-dose IV infusion for rapid NAD+ restoration — longevity, addiction recovery, or chronic fatigue",
            "schedule": [
                {"week": "Day 1",   "dose": "250mg",     "frequency": "IV infusion over 2–4 hours",            "notes": "Start slow ~50mg/hr. Slow if flushing/nausea occurs"},
                {"week": "Day 2",   "dose": "500mg",     "frequency": "IV infusion over 3–5 hours",            "notes": "Increase rate only if Day 1 tolerated well"},
                {"week": "Day 3–5", "dose": "500–750mg", "frequency": "IV infusion over 4–6 hours",            "notes": "Loading phase. Hydrate 500ml NaCl before infusion"},
                {"week": "Week 2+", "dose": "250–500mg", "frequency": "Weekly or bi-weekly maintenance IV",    "notes": "Titrate down to lowest effective dose"}
            ],
            "duration": "5-day loading then monthly maintenance",
            "notes": "Drink 500ml water before sessions. Pre-medicate with ondansetron (Zofran) 4mg if prone to nausea. Have nurse available for monitoring."
        },
        {
            "name": "Subcutaneous Protocol (Home Use)",
            "level": "Intermediate",
            "description": "Convenient SubQ protocol — good bioavailability, avoids IV side effects",
            "schedule": [
                {"week": "1–2",  "dose": "50–100mg",  "frequency": "Daily SubQ injection",          "notes": "Start low; assess tolerance and energy response"},
                {"week": "3–4",  "dose": "100–200mg", "frequency": "Daily or every other day",       "notes": "Morning dosing preferred"},
                {"week": "5+",   "dose": "100–250mg", "frequency": "3–5× per week maintenance",     "notes": "Reduce to minimum effective dose after loading"}
            ],
            "duration": "4-week loading then ongoing maintenance",
            "notes": "SubQ absorption is ~85% vs IV. Less nausea than IV. Inject into abdomen or thigh. Rotate sites. Store reconstituted solution refrigerated."
        },
        {
            "name": "Oral Precursor Protocol (NMN / NR)",
            "level": "Beginner",
            "description": "Oral supplementation via NAD+ precursors for gradual cellular repletion",
            "schedule": [
                {"week": "1–4",  "dose": "250mg NMN or 300mg NR", "frequency": "Once daily with breakfast", "notes": "Take with food containing some fat for absorption"},
                {"week": "5+",   "dose": "500mg NMN or 500mg NR", "frequency": "Once daily",                "notes": "Titrate up slowly; effects build over 4–8 weeks"}
            ],
            "duration": "Ongoing",
            "notes": "Oral precursors (NMN, NR) require conversion to NAD+ via salvage pathway. Less potent but safer and more convenient. Combine with TMG (500mg) to support methylation demands. Resveratrol or quercetin may synergize via SIRT1 activation."
        },
        {
            "name": "Addiction Recovery Protocol",
            "level": "Advanced",
            "description": "High-dose IV NAD+ used as adjunct in opioid, alcohol, or stimulant withdrawal",
            "schedule": [
                {"week": "Day 1",   "dose": "500mg",   "frequency": "IV over 4–8 hours", "notes": "Closely monitored. May reduce withdrawal cravings same day"},
                {"week": "Day 2–5", "dose": "750–1000mg","frequency": "IV over 6–10 hours","notes": "Peak therapeutic window"},
                {"week": "Day 6–10","dose": "500mg",   "frequency": "IV over 4–6 hours", "notes": "Tapering phase"},
                {"week": "Week 3+", "dose": "250–500mg","frequency": "Weekly IV",         "notes": "Maintenance and relapse prevention"}
            ],
            "duration": "10-day intensive then 3-month maintenance",
            "notes": "Protocol developed at Springfield Wellness Center. Should be supervised by addiction medicine specialist. Combine with psychological support for best outcomes."
        }
    ]'::jsonb,
    common_dosage   = '50–750mg (route dependent)',
    research_links  = ARRAY[
        'https://pubmed.ncbi.nlm.nih.gov/29514064/',
        'https://pubmed.ncbi.nlm.nih.gov/26812182/',
        'https://pubmed.ncbi.nlm.nih.gov/33653685/',
        'https://pubmed.ncbi.nlm.nih.gov/31078827/',
        'https://www.nature.com/articles/s42255-020-0241-y',
        'https://pubmed.ncbi.nlm.nih.gov/28068222/'
    ]
WHERE name = 'NAD+ (Nicotinamide Adenine Dinucleotide)';


-- ============================================================
--  RETATRUTIDE
-- ============================================================

UPDATE public.peptides SET
    category        = 'Triple Agonist (GLP-1/GIP/Glucagon)',
    half_life_hours = 144,
    description     = 'Retatrutide (LY3437943) is a first-in-class triple agonist simultaneously activating GLP-1, GIP, and glucagon receptors — sometimes called a "triple G" or GGG agonist. Developed by Eli Lilly, it is currently in Phase 3 clinical trials. Phase 2 data (NEJM 2023) showed an unprecedented ~24% mean body weight reduction at 48 weeks at the highest dose (12mg), surpassing all approved agents. Its glucagon receptor agonism boosts energy expenditure and hepatic fat clearance, while GIP and GLP-1 activity drive appetite suppression and glucose control. It also shows early promise for NASH/metabolic liver disease and sleep apnea.',
    benefits        = ARRAY[
        'Unprecedented weight loss — up to 24% body weight reduction (Phase 2, 48 weeks)',
        'Superior to semaglutide and tirzepatide in head-to-head trial comparisons',
        'Triple-receptor synergy: GLP-1 (appetite) + GIP (insulin sensitivity) + Glucagon (energy expenditure)',
        'Significantly reduces liver fat — promising for NASH/MAFLD',
        'Improves HbA1c and fasting glucose (type 2 diabetes)',
        'Reduces triglycerides and improves lipid panel',
        'Lowers systolic blood pressure',
        'Improves sleep apnea outcomes (early data)',
        'Potential reduction in cardiovascular risk (CVOT trial ongoing)',
        'Once-weekly subcutaneous injection — convenient dosing',
        'Rapid weight loss onset with continued loss trajectory to ~1 year',
        'May improve kidney function markers in obese patients'
    ],
    side_effects    = ARRAY[
        'Nausea (most common — ~60% at higher doses, typically transient)',
        'Vomiting (dose-dependent, usually resolves within 4 weeks per dose level)',
        'Diarrhea or loose stools',
        'Decreased appetite (expected and therapeutic)',
        'Constipation',
        'Eructation (belching) — more than GLP-1s alone due to glucagon component',
        'Increased heart rate (+2–4 bpm, from glucagon receptor activity)',
        'Injection site reactions (mild)',
        'Fatigue (usually transient during titration)',
        'Headache',
        'Dyspepsia / heartburn'
    ],
    warnings        = ARRAY[
        'Not yet FDA approved (Phase 3 as of 2025) — research/clinical trial use only',
        'Thyroid C-cell tumor risk (class-effect warning, shared with all GLP-1 agonists)',
        'Contraindicated with personal/family history of medullary thyroid carcinoma or MEN-2',
        'Pancreatitis risk — discontinue if unexplained severe abdominal pain',
        'Gallbladder disease risk — monitor for cholelithiasis',
        'Heart rate increase — monitor in patients with tachycardia or arrhythmia history',
        'Acute kidney injury risk if severely dehydrated from GI side effects',
        'Not for use in type 1 diabetes',
        'Hypoglycemia risk when combined with insulin or sulfonylureas',
        'Avoid during pregnancy — fetal harm observed in animal studies',
        'Muscle mass loss may accompany rapid weight reduction — resistance training recommended'
    ],
    dosage_protocols = '[
        {
            "name": "Phase 2 Trial Titration Schedule (Lilly Protocol)",
            "level": "Advanced",
            "description": "The Eli Lilly Phase 2 escalation schedule used in the NEJM 2023 trial — reference for research purposes",
            "schedule": [
                {"week": "1–4",   "dose": "1mg",  "frequency": "Once weekly SubQ", "notes": "Starter dose — minimize GI effects"},
                {"week": "5–8",   "dose": "2mg",  "frequency": "Once weekly SubQ", "notes": "Advance if well-tolerated"},
                {"week": "9–12",  "dose": "4mg",  "frequency": "Once weekly SubQ", "notes": "First meaningful weight loss phase"},
                {"week": "13–16", "dose": "4mg",  "frequency": "Once weekly SubQ", "notes": "Hold and consolidate if GI effects present"},
                {"week": "17–20", "dose": "8mg",  "frequency": "Once weekly SubQ", "notes": "Major weight loss acceleration phase"},
                {"week": "21–24", "dose": "8mg",  "frequency": "Once weekly SubQ", "notes": "Consolidation"},
                {"week": "25–28", "dose": "12mg", "frequency": "Once weekly SubQ", "notes": "Maximum dose; largest weight loss phase"},
                {"week": "29–48", "dose": "12mg", "frequency": "Once weekly SubQ", "notes": "Maintenance — ~24% total weight loss achieved at 48 weeks"}
            ],
            "duration": "48+ weeks",
            "notes": "This is the research protocol from NCT04881760. Extend each dose level by 4 extra weeks if GI side effects are present. Hydrate well; eat smaller meals. Protein intake ≥1.2g/kg body weight recommended to preserve lean mass."
        },
        {
            "name": "Conservative Community Protocol (Research Use)",
            "level": "Intermediate",
            "description": "Slower titration for individuals sensitive to GI side effects or with moderate weight loss goals",
            "schedule": [
                {"week": "1–6",   "dose": "1mg",  "frequency": "Once weekly SubQ", "notes": "Extended starter; allow gut adaptation"},
                {"week": "7–12",  "dose": "2mg",  "frequency": "Once weekly SubQ", "notes": "Evaluate GI tolerance"},
                {"week": "13–20", "dose": "4mg",  "frequency": "Once weekly SubQ", "notes": "Therapeutic dose for many users"},
                {"week": "21–28", "dose": "8mg",  "frequency": "Once weekly SubQ", "notes": "Advance only if <50% maximum tolerable GI score"},
                {"week": "29+",   "dose": "8-12mg","frequency": "Once weekly SubQ","notes": "Maintain at maximum comfortable dose"}
            ],
            "duration": "28–52 weeks",
            "notes": "Splitting the injection into 2 sites at higher doses may reduce local reactions. Anti-nausea: ginger tea, ondansetron, or domperidone as needed. Eat before injecting rather than on an empty stomach at higher doses."
        }
    ]'::jsonb,
    common_dosage   = '1mg–12mg once weekly (SubQ)',
    research_links  = ARRAY[
        'https://www.nejm.org/doi/full/10.1056/NEJMoa2301972',
        'https://pubmed.ncbi.nlm.nih.gov/37397207/',
        'https://clinicaltrials.gov/study/NCT04881760',
        'https://clinicaltrials.gov/study/NCT06015659',
        'https://www.lipidjournal.com/article/S1933-2874(23)00263-X/fulltext',
        'https://pubmed.ncbi.nlm.nih.gov/38196628/'
    ]
WHERE name = 'Retatrutide';
