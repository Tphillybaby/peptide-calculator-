-- Add new peptides to encyclopedia: LIPO-C, KLOW, GLOW, and others
-- This migration adds 17 new peptides to the peptides table

INSERT INTO public.peptides (name, category, half_life_hours, description, benefits, side_effects, warnings, dosage_protocols)
VALUES
(
    'LIPO-C',
    'Lipotropic & Fat Loss',
    4,
    'A lipotropic compound blend containing MIC (Methionine, Inositol, Choline) and other fat-burning agents. Used to support weight loss and liver function.',
    ARRAY['Enhanced fat metabolism','Liver detoxification support','Improved energy levels','Accelerated weight loss','Better nutrient absorption','Reduced cholesterol buildup','Improved mood and mental clarity'],
    ARRAY['Mild nausea','Injection site discomfort','Upset stomach','Diarrhea (rare)','Allergic reactions (rare)'],
    ARRAY['Not for use during pregnancy','Consult doctor if you have liver disease','May interact with certain medications','Monitor B12 levels if using long-term'],
    '[{"name":"Standard Protocol","level":"Beginner","description":"Weekly lipotropic injection for fat loss support","schedule":[{"week":"1-4","dose":"1ml","frequency":"Once weekly","notes":"Combine with caloric deficit"},{"week":"5-12","dose":"1ml","frequency":"Once weekly","notes":"Continue with exercise program"}],"duration":"8-12 weeks","notes":"Best results when combined with diet and exercise. Take in morning for energy boost."}]'
),
(
    'KLOW',
    'Anti-Aging & Skin',
    2,
    'A skin rejuvenation peptide blend designed to enhance skin radiance, reduce hyperpigmentation, and provide an even skin tone with a natural glow.',
    ARRAY['Reduces hyperpigmentation','Even skin tone','Enhanced skin radiance','Natural glow effect','Reduced dark spots','Improved skin texture','Anti-oxidant protection'],
    ARRAY['Mild injection site redness','Temporary skin sensitivity','Slight bruising at injection site'],
    ARRAY['Perform patch test first','Avoid sun exposure after treatment','Not for use on broken skin','Consult dermatologist if you have active skin conditions'],
    '[{"name":"Skin Brightening Protocol","level":"Beginner","description":"Weekly injections for skin tone improvement","schedule":[{"week":"1-4","dose":"2mg","frequency":"Twice weekly","notes":"Loading phase"},{"week":"5-12","dose":"2mg","frequency":"Once weekly","notes":"Maintenance phase"}],"duration":"12 weeks","notes":"Results typically visible after 4-6 weeks. Use sunscreen daily."}]'
),
(
    'GLOW',
    'Anti-Aging & Skin',
    2,
    'A comprehensive skin health peptide formulation focused on collagen production, skin hydration, and overall skin rejuvenation for a youthful, glowing appearance.',
    ARRAY['Increased collagen production','Improved skin hydration','Reduced fine lines and wrinkles','Enhanced skin elasticity','Natural radiant glow','Improved skin firmness','Accelerated skin repair'],
    ARRAY['Mild redness at injection site','Temporary skin warmth','Minor swelling (rare)'],
    ARRAY['Not recommended during pregnancy','Consult doctor if on blood thinners','May cause increased sun sensitivity','Discontinue if allergic reaction occurs'],
    '[{"name":"Anti-Aging Protocol","level":"Beginner","description":"Regular injections for skin rejuvenation","schedule":[{"week":"1-4","dose":"2-3mg","frequency":"Twice weekly","notes":"Initial phase for collagen stimulation"},{"week":"5-12","dose":"2mg","frequency":"Once weekly","notes":"Maintenance for lasting results"}],"duration":"12+ weeks","notes":"Best combined with topical skincare routine. Stay hydrated."}]'
),
(
    'Tesamorelin',
    'Growth Hormone Releasing Hormone',
    0.5,
    'An FDA-approved GHRH analog primarily used to reduce visceral adipose tissue in HIV-associated lipodystrophy. Also used off-label for anti-aging and body composition.',
    ARRAY['Reduces visceral fat','FDA-approved for lipodystrophy','Increases growth hormone production','Improves body composition','Potential cognitive benefits','Does not suppress natural GH production'],
    ARRAY['Injection site reactions','Joint pain','Muscle pain','Swelling in extremities','Paresthesia','Hyperglycemia'],
    ARRAY['Not for use with active malignancy','Monitor glucose levels','Avoid in pregnancy','May affect pituitary function','Regular IGF-1 monitoring recommended'],
    '[{"name":"Lipodystrophy Protocol","level":"Intermediate","description":"FDA-approved protocol for visceral fat reduction","schedule":[{"week":"1+","dose":"2mg","frequency":"Once daily","notes":"Subcutaneous injection before bed"}],"duration":"Ongoing (26+ weeks for full effect)","notes":"Best administered on empty stomach. Effects on trunk fat visible after 3-6 months."}]'
),
(
    'Sermorelin',
    'Growth Hormone Releasing Hormone',
    0.2,
    'A GHRH analog that stimulates the pituitary gland to produce and release growth hormone naturally. Often used for anti-aging and growth hormone deficiency.',
    ARRAY['Stimulates natural GH production','Improved sleep quality','Enhanced muscle recovery','Increased energy levels','Better skin elasticity','Supports fat metabolism','Preserves pituitary function'],
    ARRAY['Injection site pain or swelling','Flushing','Headache','Dizziness','Hyperactivity'],
    ARRAY['Not for use with active cancer','May affect blood glucose','Avoid during pregnancy','Monitor thyroid function','Use under medical supervision'],
    '[{"name":"Anti-Aging Protocol","level":"Beginner","description":"Nightly injections to support natural GH release","schedule":[{"week":"1-4","dose":"100-200mcg","frequency":"Once daily at bedtime","notes":"Start low to assess tolerance"},{"week":"5+","dose":"200-300mcg","frequency":"Once daily at bedtime","notes":"Can increase based on response"}],"duration":"3-6 months","notes":"Best taken 30 minutes before bed on empty stomach. Cycle 5 days on, 2 days off."}]'
),
(
    'Hexarelin',
    'Growth Hormone Secretagogue',
    0.5,
    'One of the strongest synthetic growth hormone releasing peptides (GHRPs). Stimulates significant GH release and has cardioprotective properties.',
    ARRAY['Potent GH release','Cardioprotective effects','Increased muscle mass','Enhanced fat loss','Improved strength','Accelerated recovery','Joint healing support'],
    ARRAY['Increased hunger','Water retention','Numbness/tingling','Elevated cortisol (at high doses)','Potential prolactin increase'],
    ARRAY['May cause desensitization with prolonged use','Avoid with cardiac conditions unless supervised','Not for pregnancy','Monitor prolactin if using long-term','Cycle to maintain effectiveness'],
    '[{"name":"Performance Protocol","level":"Intermediate","description":"Pulsatile dosing for optimal GH release","schedule":[{"week":"1-8","dose":"100mcg","frequency":"2-3 times daily","notes":"Space doses 3+ hours apart"}],"duration":"8-12 weeks then break","notes":"Take on empty stomach. Consider cycling with other GHRPs to prevent desensitization."}]'
),
(
    'GHRP-6',
    'Growth Hormone Secretagogue',
    0.3,
    'A growth hormone releasing peptide that stimulates ghrelin receptors to increase GH release. Known for strong appetite stimulation.',
    ARRAY['Significant GH release','Strong appetite stimulation','Muscle growth support','Improved sleep','Enhanced recovery','Joint and tissue healing','Increased IGF-1 levels'],
    ARRAY['Intense hunger (very common)','Water retention','Increased cortisol','Tingling and numbness','Possible prolactin elevation'],
    ARRAY['May spike blood glucose temporarily','Not ideal for those trying to reduce appetite','Avoid during pregnancy','Monitor for water retention','Use caution in diabetics'],
    '[{"name":"Bulking Protocol","level":"Beginner","description":"Multiple daily doses for GH and appetite stimulation","schedule":[{"week":"1-12","dose":"100mcg","frequency":"2-3 times daily","notes":"Pre-meals or before training"}],"duration":"8-16 weeks","notes":"Best for those wanting to increase caloric intake. Take 20-30 min before meals."}]'
),
(
    'GHRP-2',
    'Growth Hormone Secretagogue',
    0.3,
    'A growth hormone releasing peptide similar to GHRP-6 but with less appetite stimulation. Provides clean GH release with fewer side effects.',
    ARRAY['Potent GH release','Less hunger than GHRP-6','Improved sleep quality','Fat loss support','Muscle recovery','Anti-aging effects','Improved skin quality'],
    ARRAY['Mild hunger increase','Water retention (less than GHRP-6)','Numbness/tingling','Possible cortisol increase','Drowsiness'],
    ARRAY['May affect blood glucose','Avoid during pregnancy','Not for active cancer patients','Monitor IGF-1 levels periodically','Use caution with insulin'],
    '[{"name":"Recomposition Protocol","level":"Beginner","description":"Balanced GH release without excessive hunger","schedule":[{"week":"1-12","dose":"100-200mcg","frequency":"2-3 times daily","notes":"Space doses at least 3 hours apart"},{"week":"13-16","dose":"0","frequency":"Off","notes":"Break to reset sensitivity"}],"duration":"12 weeks on, 4 weeks off","notes":"Best taken on empty stomach, especially before bed. Synergistic with GHRH peptides."}]'
),
(
    'Kisspeptin',
    'Hormone & Fertility',
    0.5,
    'A neuropeptide that plays a crucial role in reproductive hormone regulation. Used in fertility treatments and for testosterone optimization.',
    ARRAY['Stimulates natural hormone production','Fertility support for both sexes','May increase testosterone naturally','Supports libido','Research use in IVF protocols','Does not suppress HPG axis'],
    ARRAY['Abdominal discomfort','Headache','Flushing','Taste disturbance','Hot flashes'],
    ARRAY['Use under medical supervision only','Not for hormone-sensitive cancers','Effects on fertility require clinical setting','Limited long-term human data','Avoid during pregnancy unless prescribed'],
    '[{"name":"Fertility Research Protocol","level":"Advanced","description":"Clinical protocol for hormone stimulation","schedule":[{"week":"Variable","dose":"1.6-12.8nmol/kg","frequency":"As directed by physician","notes":"Dose varies by clinical indication"}],"duration":"As prescribed","notes":"Should only be used under fertility specialist supervision. Dosing is highly individualized."}]'
),
(
    'DSIP',
    'Sleep & Recovery',
    7,
    'Delta Sleep-Inducing Peptide - a neuropeptide that promotes deep, restorative delta wave sleep and has stress-reducing properties.',
    ARRAY['Promotes deep delta sleep','Reduces stress and anxiety','Natural sleep without grogginess','Enhanced recovery during sleep','Potential LH release support','Antioxidant properties','Normalizes circadian rhythm'],
    ARRAY['Vivid dreams','Morning grogginess initially','Mild headache','Possible drowsiness'],
    ARRAY['Do not drive after administration','May enhance effect of sedatives','Avoid with sleep medications initially','Limited human studies','Start with low dose'],
    '[{"name":"Sleep Optimization Protocol","level":"Beginner","description":"Evening dosing for improved sleep quality","schedule":[{"week":"1-4","dose":"100mcg","frequency":"Once daily before bed","notes":"Start low to assess response"},{"week":"5+","dose":"100-300mcg","frequency":"Once daily before bed","notes":"Adjust based on sleep quality"}],"duration":"4-8 weeks","notes":"Take 30-60 minutes before intended sleep. May take 1-2 weeks to notice full benefits."}]'
),
(
    'LL-37',
    'Immune & Antimicrobial',
    0.5,
    'A human cathelicidin antimicrobial peptide with broad-spectrum activity against bacteria, viruses, and fungi. Also modulates immune response.',
    ARRAY['Broad-spectrum antimicrobial','Antiviral properties','Antifungal activity','Wound healing support','Immune system modulation','Biofilm disruption','Anti-inflammatory effects'],
    ARRAY['Injection site reaction','Possible flu-like symptoms','Temporary increase in inflammation','Redness at site'],
    ARRAY['Use sterile technique strictly','May cause immune activation','Not for autoimmune conditions without supervision','Research peptide status','Consult physician before use'],
    '[{"name":"Immune Support Protocol","level":"Intermediate","description":"Subcutaneous dosing for immune modulation","schedule":[{"week":"1-2","dose":"50-100mcg","frequency":"Every other day","notes":"Loading phase"},{"week":"3-8","dose":"100mcg","frequency":"2-3 times weekly","notes":"Maintenance"}],"duration":"6-8 weeks","notes":"Can be used locally near infection sites. Rotate injection sites."}]'
),
(
    'KPV',
    'Anti-Inflammatory',
    0.5,
    'A tripeptide derived from alpha-MSH with potent anti-inflammatory properties. Used for gut inflammation, skin conditions, and systemic inflammation.',
    ARRAY['Potent anti-inflammatory','Gut healing (IBD, colitis)','Wound healing','Antimicrobial activity','Reduces inflammatory cytokines','Skin condition improvement','Well-tolerated'],
    ARRAY['Minimal side effects reported','Mild injection site reaction','Slight nausea (oral form)'],
    ARRAY['Limited long-term human data','Use caution with immunocompromised states','Avoid during pregnancy','Monitor for allergic reactions'],
    '[{"name":"Gut Healing Protocol","level":"Beginner","description":"Protocol for inflammatory bowel support","schedule":[{"week":"1-8","dose":"200-500mcg","frequency":"Once daily","notes":"Can use oral capsules or subcutaneous"}],"duration":"8-12 weeks","notes":"Oral form may have reduced bioavailability. BPC-157 often stacked for gut healing."}]'
),
(
    'VIP',
    'Immune & Neurological',
    2,
    'Vasoactive Intestinal Peptide - a neuroendocrine peptide used for chronic inflammatory response syndrome (CIRS), mold illness, and autoimmune conditions.',
    ARRAY['CIRS treatment','Reduces brain inflammation','Regulates immune response','Supports respiratory function','Neuroprotective','Anti-inflammatory','Regulates circadian rhythm'],
    ARRAY['Nasal irritation (nasal form)','Diarrhea','Cough','Flushing','Hypotension (rare)'],
    ARRAY['Must address biotoxin exposure first','Use only under physician guidance','May lower blood pressure','Not for those with untreated infections','Requires specific CIRS protocol'],
    '[{"name":"CIRS Protocol","level":"Advanced","description":"Nasal or subcutaneous protocol for inflammatory syndrome","schedule":[{"week":"1+","dose":"50mcg","frequency":"4 times daily (nasal)","notes":"Use after binding biotoxins"}],"duration":"30+ days","notes":"Part of Shoemaker CIRS protocol. Must complete earlier steps first. Medical supervision required."}]'
),
(
    'Dihexa',
    'Cognitive & Nootropic',
    12,
    'A potent nootropic peptide derived from angiotensin IV. Shown to be millions of times more potent than BDNF in promoting neural connections.',
    ARRAY['Powerful cognitive enhancement','Promotes synaptogenesis','Memory improvement','Potential Alzheimers research application','Long-lasting effects','Enhanced learning capacity','Neuroprotective'],
    ARRAY['Headache','Mild anxiety (dose-dependent)','Fatigue initially','Elevated blood pressure (rare)'],
    ARRAY['Very potent - use minimal doses','May promote cell proliferation','Not for those with cancer history','Limited long-term safety data','Research compound only'],
    '[{"name":"Cognitive Enhancement Protocol","level":"Advanced","description":"Oral or sublingual dosing for cognitive support","schedule":[{"week":"1-4","dose":"5-10mg","frequency":"Once daily","notes":"Start at lowest dose"},{"week":"5-8","dose":"10-20mg","frequency":"Once daily","notes":"Increase only if needed"}],"duration":"4-8 weeks then cycle off","notes":"Effects may persist after discontinuation. Use extreme caution with dosing."}]'
),
(
    'Oxytocin',
    'Hormone & Social',
    3,
    'The social bonding hormone naturally produced in the hypothalamus. Used therapeutically for social anxiety, autism research, and relationship enhancement.',
    ARRAY['Increased social bonding','Reduced social anxiety','Enhanced trust and empathy','Stress reduction','Potential autism support','Improved emotional recognition','Pain modulation'],
    ARRAY['Nasal irritation','Headache','Nausea (rare)','Dizziness','Heart palpitations (rare)'],
    ARRAY['May increase tribal bias','Effects vary by individual history','Prescription/clinical use in most countries','Can affect judgment','Do not use with alcohol'],
    '[{"name":"Social Anxiety Protocol","level":"Intermediate","description":"Intranasal dosing for social situations","schedule":[{"week":"As needed","dose":"20-40 IU","frequency":"30 min before social events","notes":"Intranasal application"}],"duration":"As needed","notes":"Effects last 30-60 minutes. Not for daily use - reserve for specific situations."}]'
),
(
    'NAD+ (Nicotinamide Adenine Dinucleotide)',
    'Longevity & Mitochondrial',
    4,
    'A critical coenzyme found in every cell, essential for energy metabolism. NAD+ levels decline with age; supplementation supports cellular health and longevity.',
    ARRAY['Cellular energy production','Anti-aging support','Improved mental clarity','Enhanced DNA repair','Mitochondrial function','Addiction recovery support','Chronic fatigue support'],
    ARRAY['Nausea during IV (common)','Flushing','Chest tightness during infusion','Cramping','Headache'],
    ARRAY['IV administration should be slow','Medical supervision for IV therapy','May interact with blood pressure meds','Start with low doses','Hydrate well before treatment'],
    '[{"name":"Longevity Protocol","level":"Intermediate","description":"IV or subcutaneous NAD+ therapy","schedule":[{"week":"1","dose":"250-500mg","frequency":"Daily IV x 3-5 days","notes":"Loading phase"},{"week":"2+","dose":"100-250mg","frequency":"Weekly or monthly maintenance","notes":"Subcutaneous or IV"}],"duration":"Loading then periodic maintenance","notes":"IV infusions take 2-4 hours. Subcutaneous offers convenience with good absorption."}]'
),
(
    'PE-22-28',
    'Cognitive & Nootropic',
    8,
    'A spadin analog that acts as a TREK-1 channel blocker. Studied for antidepressant effects and cognitive enhancement with rapid onset of action.',
    ARRAY['Rapid antidepressant effects','Cognitive enhancement','Neurogenesis support','Improved mood','Enhanced learning','Stress resilience','Does not affect serotonin directly'],
    ARRAY['Headache','Mild anxiety initially','Fatigue','Sleep changes'],
    ARRAY['Novel research compound','Limited human safety data','Start with lowest effective dose','May interact with other cognitive compounds','Not for pregnancy'],
    '[{"name":"Mood Enhancement Protocol","level":"Advanced","description":"Intranasal or subcutaneous for mood support","schedule":[{"week":"1-4","dose":"50-100mcg","frequency":"Once daily","notes":"Assess response"},{"week":"5-8","dose":"100-200mcg","frequency":"Once daily","notes":"Adjust based on effects"}],"duration":"4-8 weeks","notes":"Effects may be noticed within days. Research compound - use with caution."}]'
)
ON CONFLICT (name) DO UPDATE SET
category = EXCLUDED.category,
half_life_hours = EXCLUDED.half_life_hours,
description = EXCLUDED.description,
benefits = EXCLUDED.benefits,
side_effects = EXCLUDED.side_effects,
warnings = EXCLUDED.warnings,
dosage_protocols = EXCLUDED.dosage_protocols;
