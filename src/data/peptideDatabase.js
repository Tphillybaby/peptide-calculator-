// Comprehensive peptide database with detailed information
export const PEPTIDE_DATABASE = {
    'Semaglutide': {
        name: 'Semaglutide',
        category: 'GLP-1 Agonist',
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
        warnings: [
            'Risk of thyroid C-cell tumors (animal studies)',
            'Pancreatitis risk',
            'Gallbladder problems',
            'Kidney problems in rare cases',
            'Not for type 1 diabetes',
            'Contraindicated with personal/family history of medullary thyroid carcinoma'
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
                name: 'Conservative Protocol',
                level: 'Beginner',
                description: 'Slower titration for those sensitive to side effects',
                schedule: [
                    { week: '1-6', dose: '0.25mg', frequency: 'Once weekly', notes: 'Extended low dose' },
                    { week: '7-12', dose: '0.5mg', frequency: 'Once weekly', notes: 'Gradual increase' },
                    { week: '13-20', dose: '1mg', frequency: 'Once weekly', notes: 'Maintenance dose' }
                ],
                duration: '20+ weeks',
                notes: 'Best for those with sensitive stomachs or history of GI issues'
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
        warnings: [
            'Similar thyroid tumor risk as semaglutide',
            'Pancreatitis risk',
            'Hypoglycemia when combined with insulin',
            'Gallbladder disease',
            'Acute kidney injury in dehydrated patients'
        ],
        administration: 'Subcutaneous injection once weekly',
        storage: 'Refrigerate. Protect from light.',
        researchLinks: [
            'https://www.nejm.org/doi/full/10.1056/NEJMoa2107519'
        ]
    },

    'BPC-157': {
        name: 'BPC-157',
        category: 'Healing Peptide',
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
        warnings: [
            'Limited human clinical trials',
            'Long-term safety unknown',
            'May affect blood pressure',
            'Consult doctor if on blood thinners'
        ],
        administration: 'Subcutaneous or intramuscular injection, 1-2 times daily',
        storage: 'Refrigerate after reconstitution. Use within 30 days.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/31633635/',
            'https://pubmed.ncbi.nlm.nih.gov/32568251/'
        ]
    },

    'TB-500': {
        name: 'TB-500 (Thymosin Beta-4)',
        category: 'Healing Peptide',
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
        warnings: [
            'Banned by WADA for athletes',
            'Limited long-term human studies',
            'May promote cancer cell migration (theoretical)',
            'Avoid if pregnant or breastfeeding'
        ],
        administration: 'Subcutaneous or intramuscular injection',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/20709819/'
        ]
    },

    'Ipamorelin': {
        name: 'Ipamorelin',
        category: 'Growth Hormone Secretagogue',
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
        warnings: [
            'May affect blood sugar levels',
            'Not for use with active cancer',
            'Consult doctor if diabetic',
            'May interact with thyroid medications'
        ],
        administration: 'Subcutaneous injection, typically before bed or post-workout',
        storage: 'Refrigerate after reconstitution. Use within 30 days.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/9849822/'
        ]
    },

    'CJC-1295 (no DAC)': {
        name: 'CJC-1295 (no DAC)',
        category: 'Growth Hormone Releasing Hormone',
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
        warnings: [
            'May worsen existing tumors',
            'Affects blood sugar',
            'Not for pregnant/nursing women',
            'Regular blood work recommended'
        ],
        administration: 'Subcutaneous injection, often combined with Ipamorelin',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/16352683/'
        ]
    },

    'Melanotan II': {
        name: 'Melanotan II',
        category: 'Melanocortin Agonist',
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
        warnings: [
            'Not FDA approved',
            'May increase melanoma risk (theoretical)',
            'Can darken existing moles',
            'Permanent skin darkening possible',
            'Cardiovascular effects possible'
        ],
        administration: 'Subcutaneous injection, typically in evening',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/16448591/'
        ]
    },

    'GHK-Cu': {
        name: 'GHK-Cu (Copper Peptide)',
        category: 'Healing & Anti-Aging',
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
        warnings: [
            'Avoid if allergic to copper',
            'May interact with copper supplements',
            'Limited long-term studies',
            'Consult doctor if on blood thinners'
        ],
        administration: 'Subcutaneous injection or topical application',
        storage: 'Refrigerate after reconstitution.',
        researchLinks: [
            'https://pubmed.ncbi.nlm.nih.gov/25607907/',
            'https://pubmed.ncbi.nlm.nih.gov/28294172/'
        ]
    }
};

// Add more peptides as needed
export const getPeptideInfo = (peptideName) => {
    return PEPTIDE_DATABASE[peptideName] || null;
};

export const getAllPeptides = () => {
    return Object.keys(PEPTIDE_DATABASE);
};

export const getPeptidesByCategory = (category) => {
    return Object.values(PEPTIDE_DATABASE).filter(p => p.category === category);
};
