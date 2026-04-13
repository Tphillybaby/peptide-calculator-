-- ============================================================
--  Add TRT (Testosterone) to the encyclopedia peptides table
--  so it appears in the encyclopedia listing & search
-- ============================================================

INSERT INTO public.peptides (
    name,
    category,
    half_life_hours,
    description,
    benefits,
    side_effects,
    warnings,
    dosage_protocols,
    common_dosage,
    research_links
)
SELECT
    'Testosterone (TRT)',
    'Hormone Therapy',
    156,
    'Testosterone Replacement Therapy (TRT) restores testosterone to healthy physiological levels in men with hypogonadism or age-related decline. Administered as injections (cypionate, enanthate, propionate), gels, pellets, or patches. The most widely prescribed hormone therapy globally, with decades of clinical data supporting its safety and efficacy when properly monitored.',
    ARRAY[
        'Restores energy, vitality, and libido',
        'Increases lean muscle mass and strength',
        'Reduces body fat — particularly visceral fat',
        'Improves mood, motivation, and cognitive function',
        'Increases bone mineral density — reduces osteoporosis risk',
        'Improves insulin sensitivity and metabolic markers',
        'Reduces cardiovascular risk in hypogonadal men',
        'Improves red blood cell production — reduces fatigue and anaemia',
        'Restores normal erectile function and sexual performance',
        'Enhances recovery from exercise and physical stress',
        'Improves sleep quality and reduces daytime fatigue',
        'Reduces risk of type 2 diabetes in documented hypogonadal men'
    ],
    ARRAY[
        'Erythrocytosis (elevated red blood cells / haematocrit) — require regular CBC monitoring',
        'Testicular atrophy — testes shrink due to suppressed LH/FSH',
        'Suppression of natural testosterone and sperm production (infertility risk)',
        'Acne and oily skin — often dose-dependent',
        'Hair loss / acceleration of male pattern baldness in genetically predisposed men',
        'Injection site pain or swelling (with IM/SubQ protocols)',
        'Mood swings or irritability if levels fluctuate with long injection intervals',
        'Gynecomastia if oestrogen rises unchecked — manage with AI or shorter intervals',
        'Sleep apnoea worsening in some individuals',
        'Elevated cardiovascular risk if haematocrit exceeds 52–54%'
    ],
    ARRAY[
        'Contraindicated in prostate or breast cancer',
        'Do NOT use without confirmed hypogonadism diagnosis — exogenous T suppresses the HPGA permanently',
        'Monitor haematocrit every 3–6 months; donate blood if >52%',
        'Monitor PSA annually in men over 40',
        'High doses above physiological range dramatically increase side effect risk',
        'Fertility: sperm production stops on TRT — HCG or clomiphene required to preserve it'
    ],
    '[
        {
            "name": "Standard TRT Protocol (Cypionate/Enanthate)",
            "level": "Beginner",
            "description": "The most common TRT starting protocol. Injections every 3.5-7 days to maintain stable levels.",
            "schedule": [
                {"week": "1-4",   "dose": "100 mg",    "frequency": "Every 7 days SubQ/IM", "notes": "Starter dose; allow levels to stabilise"},
                {"week": "5-8",   "dose": "100-150 mg", "frequency": "Every 7 days SubQ/IM", "notes": "First blood work at week 6"},
                {"week": "9-12",  "dose": "Adjust",    "frequency": "Based on labs",         "notes": "Target total T: 600-900 ng/dL"},
                {"week": "12+",   "dose": "Maintenance","frequency": "Every 7 days",          "notes": "Run lifelong with quarterly labs"}
            ],
            "duration": "Indefinite (ongoing hormone replacement)",
            "notes": "Twice-weekly injections (splitting the dose) produce more stable levels and can reduce oestrogen spikes. E.g., 75 mg every 3.5 days instead of 150 mg weekly."
        },
        {
            "name": "EOD Protocol (Propionate)",
            "level": "Intermediate",
            "description": "Every-other-day short-ester protocol for men sensitive to oestrogen fluctuation.",
            "schedule": [
                {"week": "1-2",  "dose": "25-30 mg",   "frequency": "Every other day SubQ", "notes": "Mimics natural diurnal rhythm more closely"},
                {"week": "3-6",  "dose": "30-40 mg",   "frequency": "Every other day SubQ", "notes": "Adjust based on feel and labs"},
                {"week": "7+",   "dose": "Maintenance","frequency": "Every other day",       "notes": "More injections but very stable peaks/troughs"}
            ],
            "duration": "Indefinite",
            "notes": "Propionate is more painful due to the propionate ester. Ideal for men prone to oestrogen side effects."
        }
    ]'::jsonb,
    '100-200 mg/week (IM or SubQ)',
    ARRAY[
        'https://pubmed.ncbi.nlm.nih.gov/29982185/',
        'https://pubmed.ncbi.nlm.nih.gov/25662915/',
        'https://pubmed.ncbi.nlm.nih.gov/31002828/',
        'https://pubmed.ncbi.nlm.nih.gov/26592031/',
        'https://www.nejm.org/doi/full/10.1056/NEJMoa1506854',
        'https://pubmed.ncbi.nlm.nih.gov/36347938/'
    ]
WHERE NOT EXISTS (
    SELECT 1 FROM public.peptides WHERE name = 'Testosterone (TRT)'
);
