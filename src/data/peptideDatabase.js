// Comprehensive peptide database with detailed information
export const PEPTIDE_DATABASE = {
    'Semaglutide': {
        name: 'Semaglutide',
        category: 'GLP-1 Agonist',
        status: 'FDA-approved for T2D/weight loss',
        halfLife: '168 hours (7 days)',
        commonDosage: '0.25mg - 2.4mg weekly',
        description: 'A GLP-1 receptor agonist primarily used for weight loss and blood sugar management.',
        benefits: [
            'Significant weight loss (10-15% body weight)',
            'Improved blood sugar control',
            'Reduced appetite and food cravings',
            'Cardiovascular benefits',
            'Improved insulin sensitivity',
            'Potential neuroprotective effects'
        ],
        sideEffects: [
            'Nausea (especially when starting)',
            'Vomiting',
            'Diarrhea or constipation',
            'Abdominal pain',
            'Fatigue',
            'Headache',
            'Dizziness'
        ],
        cons: [
            'Slow dose titration required',
            'Injectable only; not oral',
            'Can be expensive without insurance',
            'GI discomfort common during escalation',
            'Weight regain risk if stopped abruptly'
        ],
        warnings: [
            'Risk of thyroid C-cell tumors (animal studies)',
            'Pancreatitis risk',
            'Gallbladder problems',
            'Kidney problems in rare cases',
            'Not for type 1 diabetes',
            'Contraindicated with personal/family history of medullary thyroid carcinoma'
        ],
        contraindications: [
            'Personal/family history of MTC',
            'MEN2',
            'History of pancreatitis without clearance',
            'Pregnancy or breastfeeding'
        ],
        protocols: [
            {
                name: 'Standard Weight Loss Protocol',
                level: 'Beginner to Advanced',
                description: 'FDA-approved escalation schedule for weight management',
                schedule: [
                    { week: '1-4', dose: '0.25mg', frequency: 'Once weekly', notes: 'Titration phase - minimize side effects' },
                    { week: '5-8', dose: '0.5mg', frequency: 'Once weekly', notes: 'Continue if tolerating well' },
                    { week: '9-12', dose: '1mg', frequency: 'Once weekly', notes: 'Therapeutic dose for many users' },
                    { week: '13-16', dose: '1.7mg', frequency: 'Once weekly', notes: 'Optional escalation' },
                    { week: '17+', dose: '2.4mg', frequency: 'Once weekly', notes: 'Maximum dose' }
                ],
                duration: '16-20 weeks minimum',
                notes: 'Stay at each dose for at least 4 weeks. Only increase if weight loss plateaus and side effects are minimal.'
            },
            {
                name: 'Maintenance Protocol',
                level: 'Maintenance',
                description: 'After reaching goal weight',
                schedule: [
                    { week: 'Ongoing', dose: '0.5-1mg', frequency: 'Once weekly', notes: 'Lowest effective dose' }
                ],
                duration: 'Long-term',
                notes: 'Find minimum dose that maintains weight loss. Some users cycle off for 4-8 weeks periodically.'
            }
        ],
        administration: 'Subcutaneous injection once weekly',
        storage: 'Refrigerate before reconstitution. After reconstitution, use within 56 days.',
        researchLinks: [
            'https://www.nejm.org/doi/full/10.1056/NEJMoa2032183',
            'https://pubmed.ncbi.nlm.nih.gov/33567185/'
        ]
    },

    'Tirzepatide': {
        name: 'Tirzepatide',
        category: 'Dual GIP/GLP-1 Agonist',
        status: 'FDA-approved for T2D; weight loss pending regions',
        halfLife: '120 hours (5 days)',
        commonDosage: '2.5mg - 15mg weekly',
        description: 'A dual GIP and GLP-1 receptor agonist showing superior weight loss compared to semaglutide.',
        benefits: [
            'Superior weight loss (15-22% body weight)',
            'Excellent blood sugar control',
            'Improved lipid profiles',
            'Reduced cardiovascular risk',
            'Better appetite suppression than GLP-1 alone',
            'Improved insulin sensitivity'
        ],
        sideEffects: [
            'Nausea and vomiting',
            'Diarrhea',
            'Decreased appetite',
            'Constipation',
            'Indigestion',
            'Fatigue'
        ],
        cons: [
            'Significant GI side effects during titration',
            'Higher cost than most GLP-1s',
            'Injectable only',
            'Limited long-term cardiovascular data',
            'Potential hypoglycemia when combined with insulin'
        ],
        warnings: [
            'Similar thyroid tumor risk as semaglutide',
            'Pancreatitis risk',
            'Hypoglycemia when combined with insulin',
            'Gallbladder disease',
            'Acute kidney injury in dehydrated patients'
        ],
        contraindications: [
            'Personal/family history of MTC or MEN2',
            'History of pancreatitis without clearance',
            'Pregnancy or breastfeeding'
        ],
        protocols: [
            {
                name: 'Escalation Protocol',
                level: 'Beginner',
                description: 'Standard FDA titration',
                schedule: [
                    { week: '1-4', dose: '2.5mg', frequency: 'Once weekly', notes: 'Starter dose' },
                    { week: '5-8', dose: '5mg', frequency: 'Once weekly' },
                    { week: '9-12', dose: '7.5-10mg', frequency: 'Once weekly', notes: 'Advance if tolerated' },
                    { week: '13+', dose: '12.5-15mg', frequency: 'Once weekly', notes: 'Max dose' }
                ],
                duration: 'Ongoing',
                notes: 'Hold dose increases if GI effects persist.'
            }
        ],
        administration: 'Subcutaneous injection once weekly',
        storage: 'Refrigerate. Protect from light.',
        researchLinks: [
            'https://www.nejm.org/doi/full/10.1056/NEJMoa2107519'
        ]
    },

    'Liraglutide': {
        name: 'Liraglutide',
        category: 'GLP-1 Agonist',
        status: 'FDA-approved for T2D/weight loss',
        halfLife: '13 hours',
        commonDosage: '0.6mg - 3.0mg daily',
        description: 'Daily GLP-1 analog used for diabetes and chronic weight management.',
        benefits: [
            'Weight loss and appetite control',
            'Improved glycemic control',
            'Cardiovascular risk reduction',
            'Daily dosing allows quick titration changes'
        ],
        sideEffects: [
            'Nausea',
            'Vomiting',
            'Diarrhea or constipation',
            'Injection site pain'
        ],
        cons: [
            'Requires daily injections',
            'GI side effects common early',
            'Less weight loss than weekly GLP-1s',
            'Costs can be high without coverage'
        ],
        warnings: [
            'Thyroid C-cell tumor warning',
            'Pancreatitis risk',
            'Gallbladder disease'
        ],
        contraindications: [
            'Personal/family history of MTC or MEN2',
            'History of pancreatitis without clearance',
            'Pregnancy or breastfeeding'
        ],
        protocols: [
            {
                name: 'Weight Management Titration',
                level: 'Beginner',
                description: 'Standard Saxenda titration',
                schedule: [
                    { week: '1', dose: '0.6mg', frequency: 'Daily' },
                    { week: '2', dose: '1.2mg', frequency: 'Daily' },
                    { week: '3', dose: '1.8mg', frequency: 'Daily' },
                    { week: '4', dose: '2.4mg', frequency: 'Daily' },
                    { week: '5+', dose: '3.0mg', frequency: 'Daily', notes: 'Maintenance/max' }
                ],
                duration: 'Ongoing',
                notes: 'Hold or reduce dose if GI side effects persist.'
            }
        ],
        administration: 'Subcutaneous injection once daily',
        storage: 'Refrigerate unopened. After first use, may keep at room temp for 30 days.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/20573918/'
        ]
    },

    'Dulaglutide': {
        name: 'Dulaglutide',
        category: 'GLP-1 Agonist',
        status: 'FDA-approved for T2D',
        halfLife: '120 hours (5 days)',
        commonDosage: '0.75mg - 4.5mg weekly',
        description: 'Once-weekly GLP-1 analog used for glycemic control with modest weight loss.',
        benefits: [
            'Improved glycemic control',
            'Cardiovascular risk reduction data',
            'Convenient weekly dosing'
        ],
        sideEffects: [
            'Nausea',
            'Diarrhea',
            'Vomiting',
            'Abdominal pain'
        ],
        cons: [
            'Less weight loss than newer GLP-1s',
            'GI side effects during titration',
            'Not indicated for obesity alone in some regions'
        ],
        warnings: [
            'Thyroid C-cell tumor warning',
            'Pancreatitis risk',
            'Gallbladder disease'
        ],
        contraindications: [
            'Personal/family history of MTC or MEN2',
            'History of pancreatitis without clearance',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection once weekly',
        storage: 'Refrigerate. Do not freeze.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/24550040/'
        ]
    },

    'Retatrutide': {
        name: 'Retatrutide',
        category: 'Triple Agonist (GLP-1/GIP/Glucagon)',
        status: 'Investigational',
        halfLife: 'Approx. 5-7 days (investigational)',
        commonDosage: '1-12mg weekly (trial ranges)',
        description: 'Triple incretin/agonist in trials showing substantial weight loss.',
        benefits: [
            'Very high weight loss in trials',
            'Multi-pathway metabolic effects',
            'Weekly dosing'
        ],
        sideEffects: [
            'GI effects similar to GLP-1s',
            'Potential heart rate increase',
            'Injection site reactions'
        ],
        cons: [
            'Investigational; limited safety data',
            'Potential glucagon-related side effects',
            'Dosing not standardized',
            'Access limited to trials'
        ],
        warnings: [
            'Pancreatitis risk theoretical',
            'May affect heart rate',
            'Thyroid C-cell tumor warning anticipated'
        ],
        contraindications: [
            'Outside clinical trials',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection once weekly (trial protocol)',
        storage: 'Refrigerate; follow trial protocol.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/37397207/'
        ]
    },

    'BPC-157': {
        name: 'BPC-157',
        category: 'Healing Peptide',
        status: 'Research chemical',
        halfLife: '4 hours',
        commonDosage: '250-500mcg daily',
        description: 'A synthetic peptide derived from a protective protein found in stomach acid, known for healing properties.',
        benefits: [
            'Accelerated wound healing',
            'Tendon and ligament repair',
            'Muscle healing',
            'Gut healing (leaky gut, IBS)',
            'Reduced inflammation',
            'Joint pain relief',
            'Neuroprotective effects',
            'Improved blood flow'
        ],
        sideEffects: [
            'Generally well-tolerated',
            'Occasional fatigue',
            'Dizziness (rare)',
            'Nausea (rare)',
            'Headache (rare)'
        ],
        cons: [
            'Human clinical data is limited',
            'Quality/purity varies by vendor',
            'Requires frequent injections',
            'Regulatory status is unclear in many regions'
        ],
        warnings: [
            'Limited human clinical trials',
            'Long-term safety unknown',
            'May affect blood pressure',
            'Consult doctor if on blood thinners'
        ],
        contraindications: [
            'Pregnancy or breastfeeding',
            'Uncontrolled hypertension'
        ],
        protocols: [],
        administration: 'Subcutaneous or intramuscular injection, 1-2 times daily',
        storage: 'Refrigerate after reconstitution. Use within 30 days.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/31633635/',
            'https://pubmed.ncbi.nlm.nih.gov/32568251/'
        ]
    },

    'TB-500 (Thymosin Beta-4)': {
        name: 'TB-500 (Thymosin Beta-4)',
        category: 'Healing Peptide',
        status: 'Research chemical; WADA banned',
        halfLife: '120 hours (5 days)',
        commonDosage: '2-5mg twice weekly',
        description: 'A synthetic version of Thymosin Beta-4, promoting healing and recovery.',
        benefits: [
            'Enhanced tissue repair',
            'Reduced inflammation',
            'Improved flexibility',
            'Faster injury recovery',
            'Hair growth promotion',
            'Cardiovascular protection',
            'Neuroprotection'
        ],
        sideEffects: [
            'Minimal side effects reported',
            'Possible headache',
            'Lethargy',
            'Temporary flushing'
        ],
        cons: [
            'Banned by many sports organizations',
            'Relatively expensive for full cycles',
            'Often paired with other peptides to see results',
            'Limited long-term human research'
        ],
        warnings: [
            'Banned by WADA for athletes',
            'Limited long-term human studies',
            'May promote cancer cell migration (theoretical)',
            'Avoid if pregnant or breastfeeding'
        ],
        contraindications: [
            'Competitive athletes subject to testing',
            'Pregnancy or breastfeeding',
            'Active malignancy'
        ],
        protocols: [],
        administration: 'Subcutaneous or intramuscular injection',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/20709819/'
        ]
    },

    'Ipamorelin': {
        name: 'Ipamorelin',
        category: 'Growth Hormone Secretagogue',
        status: 'Research chemical',
        halfLife: '2 hours',
        commonDosage: '200-300mcg 2-3 times daily',
        description: 'A selective growth hormone secretagogue that stimulates GH release without affecting cortisol.',
        benefits: [
            'Increased growth hormone production',
            'Improved muscle mass',
            'Enhanced fat loss',
            'Better sleep quality',
            'Improved skin elasticity',
            'Faster recovery',
            'Increased bone density',
            'Anti-aging effects'
        ],
        sideEffects: [
            'Water retention (mild)',
            'Increased hunger',
            'Tingling or numbness',
            'Headache',
            'Flushing'
        ],
        cons: [
            'Multiple daily injections required',
            'Water retention and hunger can be bothersome',
            'Cost adds up over long cycles',
            'Timing around meals/workouts matters for consistency'
        ],
        warnings: [
            'May affect blood sugar levels',
            'Not for use with active cancer',
            'Consult doctor if diabetic',
            'May interact with thyroid medications'
        ],
        contraindications: [
            'Active malignancy',
            'Uncontrolled diabetes',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection, typically before bed or post-workout',
        storage: 'Refrigerate after reconstitution. Use within 30 days.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/9849822/'
        ]
    },

    'CJC-1295 (no DAC)': {
        name: 'CJC-1295 (no DAC)',
        category: 'Growth Hormone Releasing Hormone',
        status: 'Research chemical',
        halfLife: '0.5 hours (30 minutes)',
        commonDosage: '100-200mcg 2-3 times daily',
        description: 'A GHRH analog that increases growth hormone and IGF-1 levels with short half-life.',
        benefits: [
            'Increased GH and IGF-1 levels',
            'Muscle growth',
            'Fat loss',
            'Improved recovery',
            'Better sleep',
            'Enhanced immune function',
            'Increased bone density'
        ],
        sideEffects: [
            'Water retention',
            'Joint pain',
            'Carpal tunnel symptoms',
            'Increased hunger',
            'Numbness or tingling'
        ],
        cons: [
            'Very short half-life demands multiple daily injections',
            'May raise blood sugar temporarily',
            'Less convenient compared to DAC version',
            'Often needs stacking (e.g., Ipamorelin) for best effect'
        ],
        warnings: [
            'May worsen existing tumors',
            'Affects blood sugar',
            'Not for pregnant/nursing women',
            'Regular blood work recommended'
        ],
        contraindications: [
            'Active malignancy',
            'Uncontrolled diabetes',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection, often combined with Ipamorelin',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/16352683/'
        ]
    },

    'CJC-1295 (DAC)': {
        name: 'CJC-1295 (DAC)',
        category: 'Growth Hormone Releasing Hormone',
        status: 'Research chemical',
        halfLife: '168 hours (7 days)',
        commonDosage: '1-2mg once weekly',
        description: 'Long-acting GHRH analog with drug affinity complex (DAC) for extended half-life.',
        benefits: [
            'Sustained GH and IGF-1 elevation',
            'Reduced injection frequency',
            'Supports muscle gain and fat loss',
            'Improved sleep quality',
            'Potential immune support'
        ],
        sideEffects: [
            'Water retention',
            'Flu-like symptoms (rare)',
            'Joint stiffness',
            'Injection site irritation'
        ],
        cons: [
            'More expensive than no-DAC version',
            'Long half-life makes dose adjustments slower',
            'Potential for prolonged side effects',
            'Still off-label with limited human data'
        ],
        warnings: [
            'May worsen existing tumors',
            'Monitor blood glucose and IGF-1',
            'Not recommended during pregnancy',
            'Use medical supervision for long protocols'
        ],
        contraindications: [
            'Active malignancy',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection once weekly',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/16352683/'
        ]
    },

    'MK-677 (Ibutamoren)': {
        name: 'MK-677 (Ibutamoren)',
        category: 'Growth Hormone Secretagogue',
        status: 'Research chemical',
        halfLife: '24 hours',
        commonDosage: '10-25mg orally daily',
        description: 'An oral ghrelin mimetic that increases GH and IGF-1 without injections.',
        benefits: [
            'Oral dosing convenience',
            'Increased GH/IGF-1 levels',
            'Improved sleep depth',
            'Appetite stimulation',
            'Potential muscle gain and fat loss support'
        ],
        sideEffects: [
            'Water retention',
            'Increased appetite',
            'Numbness/tingling',
            'Transient insulin resistance',
            'Lethargy in some users'
        ],
        cons: [
            'Can raise fasting glucose and insulin',
            'Not ideal for those managing appetite/weight loss',
            'Edema and carpal tunnel-like symptoms possible',
            'Long half-life makes side effects linger'
        ],
        warnings: [
            'Monitor glucose and lipids',
            'Avoid in active cancer',
            'Not for pregnancy or nursing',
            'Use caution with diabetes or insulin resistance'
        ],
        contraindications: [
            'Active malignancy',
            'Uncontrolled diabetes',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Oral capsule or liquid, once daily',
        storage: 'Store in a cool, dry place away from light.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/9430604/'
        ]
    },

    'Melanotan II': {
        name: 'Melanotan II',
        category: 'Melanocortin Agonist',
        status: 'Research chemical',
        halfLife: '1 hour',
        commonDosage: '0.25-1mg daily',
        description: 'A synthetic analog of alpha-melanocyte stimulating hormone, used for tanning and libido enhancement.',
        benefits: [
            'Skin tanning without UV exposure',
            'Increased libido',
            'Potential appetite suppression',
            'Erectile function improvement',
            'Reduced sun damage risk'
        ],
        sideEffects: [
            'Nausea (common initially)',
            'Flushing',
            'Increased libido (can be unwanted)',
            'Darkening of moles and freckles',
            'Yawning and stretching',
            'Spontaneous erections'
        ],
        cons: [
            'Nausea and flushing can be intense early on',
            'Can permanently darken moles/freckles',
            'Not FDA approved; quality varies',
            'Cosmetic focus with limited safety data'
        ],
        warnings: [
            'Not FDA approved',
            'May increase melanoma risk (theoretical)',
            'Can darken existing moles',
            'Permanent skin darkening possible',
            'Cardiovascular effects possible'
        ],
        contraindications: [
            'Personal or family melanoma history',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection, typically in evening',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/16448591/'
        ]
    },

    'PT-141 (Bremelanotide)': {
        name: 'PT-141 (Bremelanotide)',
        category: 'Melanocortin Agonist',
        status: 'FDA-approved nasal for HSDD; injectable research use',
        halfLife: '2.5 hours',
        commonDosage: '1.25-1.75mg as needed',
        description: 'A melanocortin receptor agonist for sexual dysfunction in men and women.',
        benefits: [
            'Improves libido in both sexes',
            'Works independent of nitric oxide pathways',
            'Rapid onset (within 30-60 minutes)',
            'FDA-approved nasal form for female HSDD'
        ],
        sideEffects: [
            'Nausea',
            'Flushing',
            'Headache',
            'Transient blood pressure changes',
            'Injection site irritation'
        ],
        cons: [
            'Effects are short-lived',
            'Can cause pronounced nausea',
            'May temporarily raise blood pressure',
            'Cost can be high per dose'
        ],
        warnings: [
            'Avoid with uncontrolled hypertension',
            'Not for pregnancy',
            'Use caution with cardiovascular disease',
            'Nasal formulation has specific dosing limits'
        ],
        contraindications: [
            'Uncontrolled hypertension',
            'Cardiovascular disease without clearance',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection 30-60 minutes before activity',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/16034475/'
        ]
    },

    'GHK-Cu (Copper Peptide)': {
        name: 'GHK-Cu (Copper Peptide)',
        category: 'Healing & Anti-Aging',
        status: 'Cosmeceutical/research',
        halfLife: '1 hour',
        commonDosage: '1-3mg 2-3 times weekly',
        description: 'A naturally occurring copper complex with powerful healing and anti-aging properties.',
        benefits: [
            'Wound healing acceleration',
            'Collagen and elastin production',
            'Skin rejuvenation',
            'Hair growth stimulation',
            'Anti-inflammatory effects',
            'Antioxidant properties',
            'Improved skin firmness',
            'Reduced fine lines and wrinkles'
        ],
        sideEffects: [
            'Minimal side effects',
            'Possible skin irritation (topical)',
            'Mild headache (rare)',
            'Temporary redness at injection site'
        ],
        cons: [
            'Short stability once reconstituted',
            'Topical use can stain fabrics',
            'Limited systemic human data',
            'Costs increase for cosmetic use over time'
        ],
        warnings: [
            'Avoid if allergic to copper',
            'May interact with copper supplements',
            'Limited long-term studies',
            'Consult doctor if on blood thinners'
        ],
        contraindications: [
            'Copper allergy',
            'Pregnancy or breastfeeding (systemic use)'
        ],
        protocols: [],
        administration: 'Subcutaneous injection or topical application',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/25607907/',
            'https://pubmed.ncbi.nlm.nih.gov/28294172/'
        ]
    },

    'AOD-9604': {
        name: 'AOD-9604',
        category: 'Metabolic & Fat Loss',
        status: 'Research chemical',
        halfLife: '2-3 hours',
        commonDosage: '250-500mcg daily',
        description: 'A modified fragment of human growth hormone designed to promote fat loss without GH-related effects.',
        benefits: [
            'May enhance fat oxidation',
            'Minimal impact on blood sugar',
            'No significant effect on IGF-1',
            'Generally mild side effect profile'
        ],
        sideEffects: [
            'Headache (rare)',
            'Mild nausea',
            'Injection site redness'
        ],
        cons: [
            'Human data is limited and mixed',
            'Fat loss effects can be modest',
            'Requires daily injections',
            'Not FDA approved for obesity'
        ],
        warnings: [
            'Limited clinical validation',
            'Avoid during pregnancy or nursing',
            'Monitor for unexpected glucose changes'
        ],
        contraindications: [
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection once daily',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/21869961/'
        ]
    },

    'MOTS-c': {
        name: 'MOTS-c',
        category: 'Metabolic & Mitochondrial',
        status: 'Research chemical',
        halfLife: '2-4 hours',
        commonDosage: '10-20mg weekly (split doses)',
        description: 'A mitochondrial-derived peptide studied for metabolic regulation and exercise performance.',
        benefits: [
            'Improves insulin sensitivity (animal data)',
            'Supports mitochondrial function',
            'May enhance exercise performance',
            'Potential anti-inflammatory effects'
        ],
        sideEffects: [
            'Limited human data; side effects largely unknown',
            'Mild fatigue reported anecdotally',
            'Injection site irritation'
        ],
        cons: [
            'Very limited human research',
            'Dosing protocols are not standardized',
            'Expensive due to production complexity',
            'Unclear long-term safety'
        ],
        warnings: [
            'Use caution with metabolic disorders until more data emerges',
            'Avoid during pregnancy',
            'Monitor glucose if combining with other metabolic agents'
        ],
        contraindications: [
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection 2-3 times per week',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/25622254/'
        ]
    },

    'Selank': {
        name: 'Selank',
        category: 'Cognitive & Anxiolytic',
        status: 'Research; approved regionally (Russia)',
        halfLife: '0.5-1 hour',
        commonDosage: '250-750mcg 1-3 times daily (nasal or subcutaneous)',
        description: 'An anxiolytic peptide derived from tuftsin, studied for calming and cognitive effects.',
        benefits: [
            'Reduces anxiety without sedation (anecdotal)',
            'May improve focus and memory',
            'Supports immune modulation',
            'Low risk of dependence'
        ],
        sideEffects: [
            'Mild nasal irritation (if intranasal)',
            'Headache',
            'Fatigue in some users'
        ],
        cons: [
            'Short half-life requires frequent dosing',
            'Evidence primarily from small studies',
            'Effects can be subtle or subjective',
            'Not FDA approved'
        ],
        warnings: [
            'Limited long-term human data',
            'Avoid use in pregnancy',
            'Monitor for mood changes when combined with other nootropics'
        ],
        contraindications: [
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Intranasal spray or subcutaneous injection multiple times daily',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/15862908/'
        ]
    },

    'Semax': {
        name: 'Semax',
        category: 'Cognitive & Nootropic',
        status: 'Research; approved regionally (Russia)',
        halfLife: '0.5-1 hour',
        commonDosage: '200-600mcg 1-3 times daily (nasal)',
        description: 'A synthetic ACTH(4-10) analog used in Russia for cognitive support and neuroprotection.',
        benefits: [
            'May enhance focus and memory',
            'Neuroprotective properties (animal data)',
            'Potential mood stabilization',
            'Low systemic side effect burden'
        ],
        sideEffects: [
            'Nasal irritation',
            'Headache',
            'Transient blood pressure increase (rare)'
        ],
        cons: [
            'Requires multiple daily doses',
            'Clinical data is region-specific and limited',
            'Subjective effects vary widely',
            'Not approved in most countries'
        ],
        warnings: [
            'Avoid during pregnancy',
            'Use caution with uncontrolled hypertension',
            'Limited long-term safety data'
        ],
        contraindications: [
            'Pregnancy or breastfeeding',
            'Uncontrolled hypertension'
        ],
        protocols: [],
        administration: 'Intranasal spray divided through the day',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/9855565/'
        ]
    },

    'Thymosin Alpha-1': {
        name: 'Thymosin Alpha-1',
        category: 'Immune Modulator',
        status: 'Investigational/adjunctive',
        halfLife: '2 hours',
        commonDosage: '1.6mg 2-3 times weekly',
        description: 'Synthetic thymic peptide explored for immune modulation and antiviral support.',
        benefits: [
            'Supports immune response',
            'Adjunct in some infections (regional use)',
            'May aid vaccine response'
        ],
        sideEffects: [
            'Injection site redness',
            'Fatigue',
            'Mild headache'
        ],
        cons: [
            'Access varies by region',
            'Limited robust RCTs in many indications',
            'Cost for long courses'
        ],
        warnings: [
            'Use under medical supervision',
            'Potential autoimmune considerations'
        ],
        contraindications: [
            'Pregnancy or breastfeeding',
            'Autoimmune disease without clearance'
        ],
        protocols: [],
        administration: 'Subcutaneous injection several times per week',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/31445021/'
        ]
    },

    'Epithalon': {
        name: 'Epithalon',
        category: 'Longevity & Telomerase',
        status: 'Research chemical',
        halfLife: '20 minutes (plasma)',
        commonDosage: '5-10mg daily (short courses)',
        description: 'Tetrapeptide researched for potential telomerase activation and longevity effects.',
        benefits: [
            'Potential telomerase activation (animal data)',
            'Sleep quality improvements (anecdotal)',
            'Antioxidant activity'
        ],
        sideEffects: [
            'Limited human data; generally mild',
            'Injection site irritation',
            'Occasional vivid dreams'
        ],
        cons: [
            'Human evidence limited',
            'Short half-life requires daily dosing',
            'Regulatory status unclear'
        ],
        warnings: [
            'Long-term safety unknown',
            'Use caution with hormone-sensitive conditions'
        ],
        contraindications: [
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection daily for 10-20 days (cycles)',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/15123323/'
        ]
    },

    'SS-31 (Elamipretide)': {
        name: 'SS-31 (Elamipretide)',
        category: 'Mitochondrial Peptide',
        status: 'Investigational',
        halfLife: '1-2 hours',
        commonDosage: '5-10mg daily (trial-dependent)',
        description: 'A mitochondria-targeted peptide being studied for cardiomyopathy and mitochondrial disorders.',
        benefits: [
            'May improve mitochondrial function',
            'Potential cardiac protective effects',
            'Explored in ophthalmic formulations'
        ],
        sideEffects: [
            'Injection site reactions',
            'Headache',
            'Nausea'
        ],
        cons: [
            'Investigational; limited access',
            'Costly outside trials',
            'Long-term safety unknown'
        ],
        warnings: [
            'Use only under research/clinical supervision'
        ],
        contraindications: [
            'Use outside approved trials'
        ],
        protocols: [],
        administration: 'Subcutaneous injection daily (per protocol)',
        storage: 'Refrigerate; protect from light.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/21465260/'
        ]
    },

    'Cerebrolysin': {
        name: 'Cerebrolysin',
        category: 'Neuropeptide Blend',
        status: 'Approved in some countries; research elsewhere',
        halfLife: 'Variable (peptide mixture)',
        commonDosage: '5-10ml IV/IM daily (cycles)',
        description: 'A porcine brain-derived peptide mixture used in some regions for cognitive and stroke recovery support.',
        benefits: [
            'Neuroprotective properties',
            'Potential cognitive support',
            'May aid stroke recovery'
        ],
        sideEffects: [
            'Injection site pain',
            'Dizziness',
            'Headache'
        ],
        cons: [
            'IV/IM administration required',
            'Variable evidence across indications',
            'Access and regulatory status differ by country'
        ],
        warnings: [
            'Avoid in seizure disorders without clearance',
            'Use medical supervision for IV/IM'
        ],
        contraindications: [
            'History of epilepsy without clearance',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Intramuscular or intravenous injection in cycles (e.g., 10-20 days)',
        storage: 'Store at controlled room temperature; avoid freezing.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/25644553/'
        ]
    },

    'P21': {
        name: 'P21',
        category: 'Nootropic Peptide',
        status: 'Research chemical',
        halfLife: 'Not well established',
        commonDosage: '5-10mg weekly (anecdotal)',
        description: 'A synthetic peptide derived from CNTF fragments, explored for neurotrophic effects.',
        benefits: [
            'Potential neurotrophic support (preclinical)',
            'May aid cognitive function (anecdotal)'
        ],
        sideEffects: [
            'Limited data; unknown long-term safety',
            'Injection site irritation'
        ],
        cons: [
            'Very limited research',
            'Dosing is anecdotal',
            'Quality control concerns in market'
        ],
        warnings: [
            'Research-only; insufficient human safety data'
        ],
        contraindications: [
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection (research use)',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: []
    },

    'Follistatin 344': {
        name: 'Follistatin 344',
        category: 'Performance & Muscle',
        status: 'Research chemical; WADA banned',
        halfLife: '6-12 hours',
        commonDosage: '100-300mcg daily (short bursts)',
        description: 'A myostatin-binding protein fragment explored for muscle growth and recovery.',
        benefits: [
            'Potential increase in muscle mass',
            'Supports recovery',
            'May enhance strength gains',
            'Synergistic with resistance training'
        ],
        sideEffects: [
            'Injection site irritation',
            'Possible GI discomfort',
            'Unknown endocrine effects'
        ],
        cons: [
            'Human data is sparse and mostly experimental',
            'Expensive and often under-dosed commercially',
            'Short cycles make consistency hard',
            'Potential for disproportionate muscle-tendon adaptation'
        ],
        warnings: [
            'Not approved for human use',
            'Potential impact on fertility and hormones unknown',
            'Avoid if pregnant or breastfeeding'
        ],
        contraindications: [
            'Competitive athletes (banned substance)',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection daily for short cycles (2-4 weeks)',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/15345781/'
        ]
    },

    'YK-11': {
        name: 'YK-11',
        category: 'Performance & Muscle',
        status: 'Research chemical; SARM-like',
        halfLife: '6-10 hours (est.)',
        commonDosage: '5-15mg orally daily',
        description: 'A myostatin-inhibiting SARM-like compound promoted for muscle growth.',
        benefits: [
            'Potential rapid strength gains',
            'May inhibit myostatin pathways',
            'Oral dosing convenience'
        ],
        sideEffects: [
            'Joint pain',
            'Liver strain potential',
            'Hair shedding (androgenic)',
            'Aggression or mood changes'
        ],
        cons: [
            'Very limited human safety data',
            'Potential liver toxicity; requires labs',
            'Often mislabeled or impure in market',
            'Not a true peptide; regulatory risk is high'
        ],
        warnings: [
            'Hepatotoxicity risk—monitor liver enzymes',
            'Not for women who are pregnant or breastfeeding',
            'Prohormone/PCT considerations not well-studied'
        ],
        contraindications: [
            'Liver disease',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Oral capsules or liquid, once daily',
        storage: 'Store in a cool, dry place away from light.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/23118235/'
        ]
    },

    'Sermorelin': {
        name: 'Sermorelin',
        category: 'Growth Hormone Secretagogue',
        status: 'FDA-approved (discontinued brand, available generic)',
        halfLife: '10-20 minutes',
        commonDosage: '200-500mcg daily',
        description: 'A GHRH analogue used to diagnose and treat poor growth in children, and for anti-aging in adults.',
        benefits: [
            'Increases natural GH production',
            'Improved sleep quality',
            'Increased lean muscle mass',
            'Reduced body fat',
            'Faster recovery from exercise'
        ],
        sideEffects: [
            'Injection site reactions',
            'Flushing',
            'Headache',
            'Dizziness',
            'Hyperactivity'
        ],
        cons: [
            'Short half-life requiring daily injections',
            'Results can be subtle compared to HGH',
            'Requires consistent long-term use'
        ],
        warnings: [
            'Avoid in active cancer',
            'Monitor for potential insulin resistance',
            'Not for pregnancy'
        ],
        contraindications: [
            'Active malignancy',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection, typically before bed',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/18607233/'
        ]
    },

    'Tesamorelin': {
        name: 'Tesamorelin',
        category: 'Growth Hormone Releasing Hormone',
        status: 'FDA-approved for HIV-associated lipodystrophy',
        halfLife: '26-38 minutes',
        commonDosage: '1-2mg daily',
        description: 'A potent GHRH analogue specifically approved to reduce excess abdominal fat in HIV patients.',
        benefits: [
            'Significant reduction in visceral fat',
            'Increases IGF-1 levels',
            'Improves lipid profile',
            'Cognitive benefits in some studies'
        ],
        sideEffects: [
            'Joint pain',
            'Injection site redness',
            'Fluid retention',
            'Muscle aches'
        ],
        cons: [
            'Expensive compared to other GHRH peptides',
            'Daily injections required',
            'Potential for glucose intolerance'
        ],
        warnings: [
            'May increase blood sugar',
            'Monitor IGF-1 levels',
            'Avoid in active cancer'
        ],
        contraindications: [
            'Active malignancy',
            'Pregnancy',
            'Hypersensitivity to tesamorelin'
        ],
        protocols: [],
        administration: 'Subcutaneous injection once daily',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/20554796/'
        ]
    },

    'Epitalon': {
        name: 'Epitalon',
        category: 'Anti-Aging & Longevity',
        status: 'Research chemical',
        halfLife: 'Unknown (short)',
        commonDosage: '5-10mg daily (cycled)',
        description: 'A synthetic pineal peptide known for its potential to lengthen telomeres and regulate circadian rhythms.',
        benefits: [
            'Telomere elongation (anti-aging)',
            'Circadian rhythm regulation',
            'Antioxidant effects',
            'Improved sleep',
            'Potential life extension (animal studies)'
        ],
        sideEffects: [
            'None significantly reported',
            'Possible mild fatigue'
        ],
        cons: [
            'Human data on life extension is limited',
            'Optimal dosing protocols are debated',
            'Can be expensive for high-dose cycles'
        ],
        warnings: [
            'Limited long-term safety data',
            'Not for children or pregnancy'
        ],
        contraindications: [
            'Pregnancy or breastfeeding'
        ],
        protocols: [
            {
                name: 'Standard Anti-Aging Cycle',
                level: 'Intermediate',
                description: 'Khavinson Protocol',
                schedule: [
                    { week: '1-2', dose: '5-10mg', frequency: 'Daily', notes: '10-20 day course' }
                ],
                duration: 'Repeat every 6-12 months',
                notes: 'Short, high-dose courses are standard for this peptide.'
            }
        ],
        administration: 'Subcutaneous or intramuscular injection',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/12937682/'
        ]
    },

    'Thymalin': {
        name: 'Thymalin',
        category: 'Immune System',
        status: 'Research chemical (used in Russia)',
        halfLife: 'Short',
        commonDosage: '10mg daily for 10 days',
        description: 'A thymus-derived peptide bioregulator that supports immune function and T-cell differentiation.',
        benefits: [
            'Immune system restoration',
            'Enhanced T-cell function',
            'Potential anti-tumor effects (adjunct)',
            'Reduced inflammation'
        ],
        sideEffects: [
            'None significantly reported',
            'Injection site irritation'
        ],
        cons: [
            'Sourcing authentic product can be difficult',
            'Limited Western clinical data',
            'Requires high doses (10mg)'
        ],
        warnings: [
            'Consult doctor if you have autoimmune conditions',
            'Not for pregnancy'
        ],
        contraindications: [
            'Pregnancy or breastfeeding',
            'Organ transplant recipients (immune boosting)'
        ],
        protocols: [],
        administration: 'Intramuscular injection',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/12577695/'
        ]
    },

    'DSIP (Delta Sleep-Inducing Peptide)': {
        name: 'DSIP (Delta Sleep-Inducing Peptide)',
        category: 'Neurological & Sleep',
        status: 'Research chemical',
        halfLife: '15 minutes (rapid breakdown)',
        commonDosage: '100mcg before bed',
        description: 'A neuropeptide that promotes deep (delta) wave sleep and stress reduction.',
        benefits: [
            'Induces deep, restorative sleep',
            'Reduces stress and cortisol',
            'Potential pain relief',
            'Normalization of blood pressure'
        ],
        sideEffects: [
            'Grogginess upon waking (if dose too high)',
            'Headache',
            'Nausea (rare)'
        ],
        cons: [
            'Effects can be inconsistent between users',
            'Very short half-life',
            'Optimal timing is critical'
        ],
        warnings: [
            'Do not drive after administration',
            'Start with low dose to assess tolerance'
        ],
        contraindications: [
            'Pregnancy or breastfeeding',
            'Narcolepsy'
        ],
        protocols: [],
        administration: 'Subcutaneous injection 1-2 hours before bed',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/6548967/'
        ]
    },

    'Foxo4-DRI': {
        name: 'Foxo4-DRI',
        category: 'Anti-Aging (Senolytic)',
        status: 'Experimental Research Chemical',
        halfLife: 'Unknown',
        commonDosage: 'Research protocols vary (e.g., 1-3mg every other day)',
        description: 'A senolytic peptide designed to target and eliminate senescent ("zombie") cells.',
        benefits: [
            'Removal of senescent cells',
            'Tissue rejuvenation',
            'Improved kidney function (animal studies)',
            'Coat/hair restoration (animal studies)'
        ],
        sideEffects: [
            'Fatigue (common during clearing phase)',
            'Flu-like symptoms',
            'Muscle aches'
        ],
        cons: [
            'Very expensive',
            'Highly experimental; human safety unproven',
            'Mechanism involves cell death (apoptosis)'
        ],
        warnings: [
            'Strictly experimental',
            'Potential for off-target effects',
            'Do not use without medical guidance'
        ],
        contraindications: [
            'Pregnancy or breastfeeding',
            'Any active medical condition'
        ],
        protocols: [],
        administration: 'Subcutaneous injection',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/28340339/'
        ]
    },

    'ARA-290 (Cibinetide)': {
        name: 'ARA-290 (Cibinetide)',
        category: 'Healing & Neuropathy',
        status: 'Research chemical',
        halfLife: 'Short',
        commonDosage: '4mg daily',
        description: 'A non-hematopoietic EPO derivative designed to repair small nerve fibers and reduce neuropathic pain.',
        benefits: [
            'Small fiber neuropathy repair',
            'Pain reduction',
            'Anti-inflammatory',
            'Improved HbA1c (some studies)'
        ],
        sideEffects: [
            'Generally mild',
            'Injection site reactions'
        ],
        cons: [
            'Very expensive due to high daily dose (4mg)',
            'Daily injections required',
            'Hard to source'
        ],
        warnings: [
            'Monitor blood pressure',
            'Limited long-term safety data'
        ],
        contraindications: [
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection daily',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/25613020/'
        ]
    },

    '5-Amino-1MQ': {
        name: '5-Amino-1MQ',
        category: 'Metabolic & Fat Loss',
        status: 'Research chemical',
        halfLife: 'Unknown',
        commonDosage: '50-150mg daily (oral)',
        description: 'A small molecule NNMT inhibitor that increases cellular NAD+ and metabolic rate.',
        benefits: [
            'Increased metabolic rate',
            'Fat loss without muscle loss',
            'Muscle satellite cell activation',
            'Increased NAD+ levels'
        ],
        sideEffects: [
            'Insomnia (if taken late)',
            'Headache',
            'GI upset'
        ],
        cons: [
            'Oral bioavailability issues (requires special caps)',
            'Expensive',
            'Not a peptide (small molecule)'
        ],
        warnings: [
            'Monitor liver function',
            'Avoid if prone to insomnia'
        ],
        contraindications: [
            'Pregnancy or breastfeeding',
            'Liver disease'
        ],
        protocols: [],
        administration: 'Oral capsules daily with food',
        storage: 'Store in cool, dry place.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/31339666/'
        ]
    },

    'NAD+ (Nicotinamide Adenine Dinucleotide)': {
        name: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
        category: 'Cellular Energy & Anti-Aging',
        status: 'Supplement/Therapy',
        halfLife: 'Short (rapidly metabolized)',
        commonDosage: '100-500mg (IV/IM/SubQ)',
        description: 'A critical coenzyme found in every cell, essential for energy production (ATP) and DNA repair.',
        benefits: [
            'Increased energy and stamina',
            'Improved mental clarity and focus',
            'DNA repair support (PARP activation)',
            'Anti-aging (sirtuin activation)',
            'Addiction recovery support'
        ],
        sideEffects: [
            'Nausea (common with rapid IV)',
            'Flushing/Chest pressure (IV)',
            'Headache',
            'Fatigue initially'
        ],
        cons: [
            'IV infusions are expensive and time-consuming',
            'SubQ injections can be painful (burns)',
            'Oral bioavailability is poor (precursors preferred)'
        ],
        warnings: [
            'Start low to assess tolerance',
            'May interact with certain chemotherapy drugs'
        ],
        contraindications: [
            'Active cancer (theoretical risk)',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection (often burns), IM, or IV drip',
        storage: 'Refrigerate. Protect from light.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/29514064/'
        ]
    },

    'Glutathione': {
        name: 'Glutathione',
        category: 'Antioxidant & Detox',
        status: 'Supplement/Therapy',
        halfLife: '10-90 minutes',
        commonDosage: '200-600mg daily or weekly',
        description: 'The body\'s "master antioxidant," crucial for detoxification, immune function, and reducing oxidative stress.',
        benefits: [
            'Powerful antioxidant support',
            'Liver detoxification',
            'Skin brightening/lightening',
            'Immune system boost',
            'Reduced inflammation'
        ],
        sideEffects: [
            'Rare allergic reactions',
            'Lower zinc levels (long term)',
            'Asthma exacerbation (inhaled form)'
        ],
        cons: [
            'Poor oral bioavailability',
            'Oxidizes quickly in solution',
            'Frequent dosing needed for sustained levels'
        ],
        warnings: [
            'Avoid if sulfite sensitive',
            'Consult doctor if asthmatic'
        ],
        contraindications: [
            'Sulfite allergy',
            'Pregnancy (consult doctor)'
        ],
        protocols: [],
        administration: 'Intramuscular, IV, or nebulized',
        storage: 'Refrigerate. Do not use if cloudy.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/21908948/'
        ]
    },

    'Oxytocin': {
        name: 'Oxytocin',
        category: 'Hormone & Mood',
        status: 'Prescription Drug',
        halfLife: '1-6 minutes',
        commonDosage: '10-50 IU (Nasal) or 10-20 IU (SubQ)',
        description: 'The "love hormone" involved in social bonding, trust, and stress reduction.',
        benefits: [
            'Enhanced social bonding and trust',
            'Reduced anxiety and stress',
            'Improved libido and orgasm',
            'Potential autism support',
            'Pain relief'
        ],
        sideEffects: [
            'Headache',
            'Nausea',
            'Dizziness',
            'Uterine contractions (women)'
        ],
        cons: [
            'Very short half-life',
            'Effects can be subtle or context-dependent',
            'Nasal spray absorption varies'
        ],
        warnings: [
            'Do not use if pregnant (induces labor)',
            'Monitor blood pressure'
        ],
        contraindications: [
            'Pregnancy (unless for labor)',
            'Severe cardiovascular disease'
        ],
        protocols: [],
        administration: 'Nasal spray or subcutaneous injection',
        storage: 'Refrigerate.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/20548365/'
        ]
    },

    'KPV': {
        name: 'KPV',
        category: 'Anti-Inflammatory & Gut',
        status: 'Research chemical',
        halfLife: 'Short',
        commonDosage: '200-500mcg daily',
        description: 'A tripeptide (Lysine-Proline-Valine) derived from alpha-MSH, known for potent anti-inflammatory effects.',
        benefits: [
            'Potent anti-inflammatory',
            'Gut health (IBD/IBS support)',
            'Antimicrobial (Candida/Mold)',
            'Skin health (Psoriasis/Eczema)',
            'Non-hormonal (no tanning/libido effects)'
        ],
        sideEffects: [
            'None significantly reported',
            'Injection site irritation'
        ],
        cons: [
            'Limited human clinical trials',
            'Oral forms require special coating',
            'Hard to source high quality'
        ],
        warnings: [
            'Consult doctor for autoimmune conditions'
        ],
        contraindications: [
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection or oral capsule',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/10504176/'
        ]
    },

    'LL-37 (Cathelicidin)': {
        name: 'LL-37 (Cathelicidin)',
        category: 'Antimicrobial & Immune',
        status: 'Research chemical',
        halfLife: 'Short',
        commonDosage: '100mcg daily (cycled)',
        description: 'A powerful antimicrobial peptide produced by the body to fight bacteria, viruses, and fungi.',
        benefits: [
            'Broad-spectrum antimicrobial',
            'Biofilm disruptor',
            'Wound healing',
            'Immune modulation',
            'Gut health support'
        ],
        sideEffects: [
            'Herxheimer reaction (die-off)',
            'Injection site pain/redness',
            'Inflammation (if dose too high)'
        ],
        cons: [
            'Can trigger autoimmune flares in some',
            '"Die-off" symptoms can be severe',
            'Expensive'
        ],
        warnings: [
            'Start very low to avoid Herx reaction',
            'Avoid in autoimmune diseases (Lupus/RA) unless supervised'
        ],
        contraindications: [
            'Autoimmune diseases (relative)',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/17007963/'
        ]
    },

    'Dihexa': {
        name: 'Dihexa',
        category: 'Nootropic & Cognitive',
        status: 'Research chemical',
        halfLife: 'Long (days)',
        commonDosage: '10-20mg weekly (oral/transdermal)',
        description: 'A potent angiotensin IV analog that stimulates new neural connections (synaptogenesis).',
        benefits: [
            'Powerful cognitive enhancement',
            'Improved memory and learning',
            'Neuroprotection',
            'Potential Alzheimer\'s/Parkinson\'s support',
            'Repair of brain damage'
        ],
        sideEffects: [
            'Headache',
            'Irritability',
            'Insomnia',
            'Potential tumor growth promotion (theoretical)'
        ],
        cons: [
            'Potency requires careful dosing',
            'Long-term safety unknown',
            'Theoretical cancer risk (angiogenesis)'
        ],
        warnings: [
            'Avoid in active cancer',
            'Do not combine with other potent stimulants'
        ],
        contraindications: [
            'Active malignancy',
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Oral or transdermal cream',
        storage: 'Store in cool, dry place.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/23168565/'
        ]
    },



    'IGF-1 LR3': {
        name: 'IGF-1 LR3',
        category: 'Growth & Muscle',
        status: 'Research chemical',
        halfLife: '20-30 hours',
        commonDosage: '20-50mcg daily (cycled)',
        description: 'A long-acting analog of Insulin-like Growth Factor 1, potent for muscle growth and recovery.',
        benefits: [
            'Significant muscle hyperplasia',
            'Enhanced recovery',
            'Nutrient shuttling',
            'Fat loss',
            'Improved pumps'
        ],
        sideEffects: [
            'Hypoglycemia (low blood sugar)',
            'Gut distension ("GH gut") at high doses',
            'Headache',
            'Nausea'
        ],
        cons: [
            'Risk of hypoglycemia is real',
            'Receptor downregulation if not cycled',
            'Can promote tumor growth'
        ],
        warnings: [
            'Consume carbs post-injection',
            'Avoid in active cancer',
            'Do not use for long periods'
        ],
        contraindications: [
            'Active malignancy',
            'Hypoglycemia prone',
            'Pregnancy'
        ],
        protocols: [],
        administration: 'Subcutaneous or intramuscular injection',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/18607233/'
        ]
    },

    'HGH Frag 176-191': {
        name: 'HGH Frag 176-191',
        category: 'Fat Loss',
        status: 'Research chemical',
        halfLife: 'Short',
        commonDosage: '250-500mcg twice daily',
        description: 'A fragment of the HGH molecule specifically isolated for its fat-burning properties without glycemic effects.',
        benefits: [
            'Targeted fat loss',
            'No effect on blood sugar',
            'No water retention',
            'No effect on IGF-1 levels'
        ],
        sideEffects: [
            'Injection site redness',
            'Mild headache'
        ],
        cons: [
            'Must be taken on empty stomach',
            'Timing is critical for results',
            'Fragile peptide'
        ],
        warnings: [
            'Ensure fasted state for efficacy'
        ],
        contraindications: [
            'Pregnancy or breastfeeding'
        ],
        protocols: [],
        administration: 'Subcutaneous injection (fasted)',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/11713213/'
        ]
    },

    'Kisspeptin-10': {
        name: 'Kisspeptin-10',
        category: 'Hormone & Fertility',
        status: 'Research chemical',
        halfLife: 'Short',
        commonDosage: '100mcg daily',
        description: 'A peptide that stimulates GnRH release, boosting testosterone and fertility without shutting down natural production.',
        benefits: [
            'Increased testosterone',
            'Improved fertility/sperm quality',
            'Libido enhancement',
            'Alternative to HCG'
        ],
        sideEffects: [
            'Flushing',
            'Headache',
            'Injection site pain'
        ],
        cons: [
            'Short half-life requiring frequent dosing',
            'Less potent than TRT',
            'Limited long-term data'
        ],
        warnings: [
            'Monitor hormone levels'
        ],
        contraindications: [
            'Hormone-sensitive cancers',
            'Pregnancy'
        ],
        protocols: [],
        administration: 'Subcutaneous injection',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/16260654/'
        ]
    },

    'VIP (Vasoactive Intestinal Peptide)': {
        name: 'VIP (Vasoactive Intestinal Peptide)',
        category: 'Immune & CIRS',
        status: 'Prescription/Compound',
        halfLife: 'Short',
        commonDosage: '50mcg 4x daily (Nasal)',
        description: 'A neuropeptide used primarily in the Shoemaker Protocol for mold toxicity and CIRS.',
        benefits: [
            'Reduces inflammation (CIRS)',
            'Improves hormonal regulation',
            'Supports brain health',
            'Pulmonary hypertension support'
        ],
        sideEffects: [
            'Low blood pressure',
            'Palpitations',
            'Headache',
            'Flushing'
        ],
        cons: [
            'Frequent dosing required (4x daily)',
            'Must pass VCS test before starting (CIRS)',
            'Expensive'
        ],
        warnings: [
            'Monitor lipase levels',
            'Monitor blood pressure'
        ],
        contraindications: [
            'Failed VCS test (CIRS protocol)',
            'Pregnancy'
        ],
        protocols: [],
        administration: 'Nasal spray',
        storage: 'Refrigerate.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/23566056/'
        ]
    },

    'Melanotan 1 (Afamelanotide)': {
        name: 'Melanotan 1 (Afamelanotide)',
        category: 'Melanocortin Agonist',
        status: 'FDA-approved (Implants)',
        halfLife: 'Short (minutes) / Implants (months)',
        commonDosage: '1-2mg daily (Injection)',
        description: 'A synthetic analog of alpha-MSH that induces tanning with fewer side effects than Melanotan II.',
        benefits: [
            'Increased melanin production (tanning)',
            'Photoprotection from UV damage',
            'Less nausea/flushing than Melanotan II',
            'Used for Erythropoietic Protoporphyria (EPP)'
        ],
        sideEffects: [
            'Nausea (mild)',
            'Flushing',
            'Injection site reactions'
        ],
        cons: [
            'Requires daily dosing (injectable)',
            'Less libido effect than MT2 (pro/con)',
            'Suppliers less common than MT2'
        ],
        warnings: [
            'Monitor moles/freckles for changes',
            'Not FDA approved as injectable'
        ],
        contraindications: [
            'Melanoma history',
            'Pregnancy'
        ],
        protocols: [],
        administration: 'Subcutaneous injection',
        storage: 'Refrigerate.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/15056820/'
        ]
    },

    'HGH Fragment 176-191': {
        name: 'HGH Fragment 176-191',
        category: 'Fat Loss',
        status: 'Research chemical',
        halfLife: '< 1 hour',
        commonDosage: '250-500mcg twice daily',
        description: 'A stabilized fragment of the GH molecule (C-terminus) that specifically targets fat loss (lipolysis) without affecting insulin or IGF-1.',
        benefits: [
            'Potent fat loss aid',
            'No effect on blood glucose',
            'No water retention',
            'Does not impact IGF-1 levels'
        ],
        sideEffects: [
            'Injection site redness',
            'Rare feeling of flushing'
        ],
        cons: [
            'Very fragile peptide',
            'Must be taken on empty stomach (fasted)',
            'Short duration of action'
        ],
        warnings: [
            'Ensure purity (often faked)',
            'Avoid eating 2 hours before/after'
        ],
        contraindications: [
            'Pregnancy'
        ],
        protocols: [],
        administration: 'Subcutaneous injection (AM fasted / Pre-bed fasted)',
        storage: 'Refrigerate.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/11713213/'
        ]
    },

    'GHRP-6': {
        name: 'GHRP-6',
        category: 'Growth Hormone Secretagogue',
        status: 'Research chemical',
        halfLife: '2-3 hours',
        commonDosage: '100-200mcg 3x daily',
        description: 'A powerful GH secretagogue known for stimulating significant appetite and growth hormone release.',
        benefits: [
            'Increases Growth Hormone',
            'Stimulates appetite (bulking)',
            'Improved recovery',
            'Anti-inflammatory'
        ],
        sideEffects: [
            'Intense hunger',
            'Water retention',
            'Prolactin increase (dose dependent)',
            'Cortisol increase (mild)'
        ],
        cons: [
            'Hunger can be uncontrollable',
            'Requires multiple daily injections',
            'Water weight gain'
        ],
        warnings: [
            'Monitor prolactin',
            'Monitor blood glucose'
        ],
        contraindications: [
            'History of prolactinoma',
            'Active cancer'
        ],
        protocols: [],
        administration: 'Subcutaneous injection',
        storage: 'Refrigerate.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/8492102/'
        ]
    },

    'GHRP-2 (Pralmorelin)': {
        name: 'GHRP-2 (Pralmorelin)',
        category: 'Growth Hormone Secretagogue',
        status: 'Research chemical',
        halfLife: '2-3 hours',
        commonDosage: '100mcg 3x daily',
        description: 'A potent GH secretagogue, releasing more GH than GHRP-6 with less appetite stimulation.',
        benefits: [
            'Strong GH release',
            'Moderate appetite increase (less than GHRP-6)',
            'Muscle preservation',
            'Fat loss support'
        ],
        sideEffects: [
            'Cortisol elevation',
            'Prolactin elevation',
            'Water retention',
            'Lethargy'
        ],
        cons: [
            'Higher cortisol/prolactin risk than Ipamorelin',
            'Desensitization possible without breaks'
        ],
        warnings: [
            'Monitor cortisol and prolactin',
            'Cycle use'
        ],
        contraindications: [
            'Prolactinoma / Pituitary issues',
            'Active malignancy'
        ],
        protocols: [],
        administration: 'Subcutaneous injection',
        storage: 'Refrigerate.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/8883203/'
        ]
    },

    'Hexarelin': {
        name: 'Hexarelin',
        category: 'Growth Hormone Secretagogue',
        status: 'Research chemical',
        halfLife: '70 minutes',
        commonDosage: '100-200mcg daily',
        description: 'The strongest of the GHRPs for GH release, but prone to rapid desensitization.',
        benefits: [
            'Massive GH pulse',
            'Potential cardioprotective effects',
            'Muscle strength gains',
            'Fat loss'
        ],
        sideEffects: [
            'High prolactin spike',
            'Cortisol spike',
            'Water retention',
            'Carpal tunnel symptoms'
        ],
        cons: [
            'Rapid receptor downregulation (max 2-4 weeks use)',
            'Harsh side effect profile',
            'Requires breaks'
        ],
        warnings: [
            'Short cycle only',
            'Monitor heart health (beneficial but potent)'
        ],
        contraindications: [
            'Prolactin sensitive individuals',
            'Daily long-term use'
        ],
        protocols: [],
        administration: 'Subcutaneous injection',
        storage: 'Refrigerate.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/9583277/'
        ]
    },

    'PEG-MGF': {
        name: 'PEG-MGF',
        category: 'Growth & Muscle',
        status: 'Research chemical',
        halfLife: '48-72 hours',
        commonDosage: '200-400mcg post-workout',
        description: 'Pegylated Mechano Growth Factor, a variant of IGF-1 that promotes satellite cell activation and muscle repair.',
        benefits: [
            'Localized muscle growth (site enhancement)',
            'Satellite cell activation',
            'Systemic recovery',
            'Neuroprotection'
        ],
        sideEffects: [
            'Hypoglycemia (mild risk)',
            'Injection site pain',
            'Itchiness'
        ],
        cons: [
            'Best used post-workout only',
            'Long half-life means systemic effect dominates site effect',
            'Limited human data'
        ],
        warnings: [
            'Do not use pre-workout',
            'Potential for hypoglycemia'
        ],
        contraindications: [
            'Active cancer',
            'Hypoglycemia prone'
        ],
        protocols: [],
        administration: 'Subcutaneous or Intramuscular (into trained muscle)',
        storage: 'Refrigerate.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/22020228/'
        ]
    },

    'Foxo4-DRI': {
        name: 'Foxo4-DRI',
        category: 'Senolytic (Anti-Aging)',
        status: 'Research chemical (Experimental)',
        halfLife: 'Unknown (Short)',
        commonDosage: 'Experimental protocols (e.g. 3-10mg/cycle)',
        description: 'A peptide designed to target and eliminate senescent ("zombie") cells to rejuvenate tissues.',
        benefits: [
            'Eliminates senescent cells',
            'Improves tissue function',
            'Coat condition improvement (mice)',
            'Kidney function restoration (mice)'
        ],
        sideEffects: [
            'Fatigue (during clearance)',
            'Flu-like symptoms',
            'Muscle aches'
        ],
        cons: [
            'Extremely expensive',
            'Very limited human data',
            'Hard to synthesize correctly'
        ],
        warnings: [
            'Highly experimental',
            'Clearance of too many cells at once can be stressful'
        ],
        contraindications: [
            'Unknown',
            'Caution advised'
        ],
        protocols: [],
        administration: 'Subcutaneous injection',
        storage: 'Freeze or Refrigerate.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/28340339/'
        ]
    },

    '5-Amino-1MQ': {
        name: '5-Amino-1MQ',
        category: 'Metabolic & Fat Loss',
        status: 'Research chemical (small molecule)',
        halfLife: 'Oral bioavailability',
        commonDosage: '50-150mg daily (Oral)',
        description: 'Small molecule NNMT inhibitor that increases cellular NAD+ and metabolic rate.',
        benefits: [
            'Increased metabolic rate',
            'Fat loss without CNS stimulation',
            'Increases NAD+ levels',
            'Muscle preservation'
        ],
        sideEffects: [
            'Insomnia (if taken late)',
            'Mild GI upset'
        ],
        cons: [
            'Expensive',
            'Oral bioavailability issues if not formulated well',
            'New compound'
        ],
        warnings: [
            'Don\'t take before bed'
        ],
        contraindications: [
            'Pregnancy',
            'Severe liver disease'
        ],
        protocols: [],
        administration: 'Oral capsule',
        storage: 'Cool, dry place.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/29969636/'
        ]
    },

    'Dihexa': {
        name: 'Dihexa',
        category: 'Nootropic & Cognitive',
        status: 'Research chemical',
        halfLife: 'Long (days)',
        commonDosage: '10-20mg Ora/Transdermal',
        description: 'A potent angiotensin IV analog derived peptide promoting synaptogenesis (brain connection growth).',
        benefits: [
            'Powerful neurogenesis',
            'Cognitive enhancement',
            'Memory repair',
            'Stroke/TBI recovery potential'
        ],
        sideEffects: [
            'Autism-like overstimulation (rare)',
            'Irritability',
            'Headache'
        ],
        cons: [
            'Concern about cancer growth (angiogenesis)',
            'Very potent; easy to overdose',
            'Limited long-term safety'
        ],
        warnings: [
            'Monitor for cancerous growths (theoretical risk due to growth factors)',
            'Do not combine with other potent growth agents'
        ],
        contraindications: [
            'History of cancer',
            'Pregnancy'
        ],
        protocols: [],
        administration: 'Oral or Transdermal (DMSO)',
        storage: 'Room temperature.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/23168565/'
        ]
    },

    'Oxytocin': {
        name: 'Oxytocin',
        category: 'Hormone & Wellness',
        status: 'Prescription/Compound',
        halfLife: '3-5 minutes',
        commonDosage: '10-20IU (Nasal) or 5-10IU (SubQ)',
        description: 'The "love hormone" involved in bonding, stress reduction, and sexual arousal.',
        benefits: [
            'Improved social bonding',
            'Stress/Cortisol reduction',
            'Enhanced orgasm/libido',
            'Mood elevation'
        ],
        sideEffects: [
            'Headache',
            'Nausea',
            'Uterine contractions (females)'
        ],
        cons: [
            'Very short duration',
            'Nasal absorption varies',
            'Can induce labor in pregnancy'
        ],
        warnings: [
            'Do not use if pregnant (induces labor)',
            'Monitor blood pressure'
        ],
        contraindications: [
            'Pregnancy'
        ],
        protocols: [],
        administration: 'Nasal spray or Subcutaneous injection',
        storage: 'Refrigerate.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/1601267/'
        ]
    }
};

export const getPeptideInfo = (peptideName) => {
    return PEPTIDE_DATABASE[peptideName] || null;
};

export const getAllPeptides = () => {
    return Object.values(PEPTIDE_DATABASE);
};

export const getPeptidesByCategory = (category) => {
    return Object.values(PEPTIDE_DATABASE).filter(p => p.category === category);
};
