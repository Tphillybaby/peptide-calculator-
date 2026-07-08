-- Migration: Add new peptides, blends, and stacks to the encyclopedia
-- Adds: VK2735, Amycretin, Danuglipron, CJC-1295+Ipamorelin Blend,
--        Tesamorelin+Ipamorelin Stack, BPC-157+KPV+GHK-Cu Stack, Semax+Selank Stack,
--        MOTS-c+SS-31 Stack, Thymalin+Epithalon Stack, Klotho Peptide Fragment,
--        Humanin Analog (HNG), Kisspeptin-54, Tirzepatide/B12 Compound,
--        Semaglutide+BPC-157 Stack, LL-37+GHK-Cu Stack, Palmitoyl Oligopeptide,
--        Lonapegsomatropin
-- Also: Update IGF-1 LR3 with aliases in description and dosage protocols

-- ============================================================
-- PART 1: Enrich IGF-1 LR3 (add aliases to description + dosage protocols)
-- ============================================================
UPDATE public.peptides SET
    description = 'A modified Insulin-like Growth Factor 1 (IGF-1 Long R3, also known as IGF-1 LR3, IGF1-LR3, IGF1lr3, or IGL1lr3) with an extended half-life of 20–30 hours. Unlike native IGF-1, it does not bind to IGF-binding proteins, remaining active in the bloodstream significantly longer for enhanced anabolic and recovery effects.',
    common_dosage = '20–50 mcg/day (cycled 4–6 weeks)',
    dosage_protocols = '[
        {
            "name": "Beginner Muscle Growth & Recovery",
            "level": "Beginner",
            "description": "Conservative protocol to assess IGF-1 LR3 response and minimize hypoglycemia risk",
            "schedule": [
                {"week": "1-2", "dose": "20mcg", "frequency": "Once daily post-workout", "notes": "Inject immediately after training, subcutaneous or intramuscular near trained muscles. Monitor blood glucose closely."},
                {"week": "3-4", "dose": "30mcg", "frequency": "Once daily post-workout", "notes": "Increase only if tolerating well with no hypoglycemia symptoms."}
            ],
            "duration": "4 weeks on, 4+ weeks off",
            "notes": "Always have fast-acting carbs on hand. Do not use if fasted. Cycle strictly to prevent receptor desensitization and IGF-1 axis suppression."
        },
        {
            "name": "Advanced Hyperplasia Protocol",
            "level": "Advanced",
            "description": "Higher-dose protocol used by experienced researchers for muscle hyperplasia and accelerated recovery",
            "schedule": [
                {"week": "1-2", "dose": "40mcg", "frequency": "Once daily post-workout", "notes": "Inject subcutaneous or intramuscular into the trained muscle group."},
                {"week": "3-6", "dose": "50mcg", "frequency": "Once daily post-workout", "notes": "Can split into 25mcg AM + 25mcg post-workout for broader coverage."}
            ],
            "duration": "4–6 weeks on, 4–6 weeks off",
            "notes": "Blood glucose monitoring is essential. Use with a high-protein meal post-injection. Avoid combining with insulin without medical supervision."
        }
    ]'::jsonb
WHERE name = 'IGF-1 LR3';

-- ============================================================
-- PART 2: Insert new peptides, blends, and stacks
-- ============================================================

INSERT INTO public.peptides (name, category, half_life_hours, description, benefits, side_effects, warnings, common_dosage, dosage_protocols)
VALUES

-- ===================== NEXT-GEN GLP-1s =====================
(
    'VK2735',
    'Dual GIP/GLP-1 Agonist',
    168,
    'An investigational dual GLP-1 and GIP receptor agonist developed by Viking Therapeutics. Currently in Phase 3 clinical trials (VANQUISH program), VK2735 has demonstrated superior weight loss efficacy compared to placebo and is available in both subcutaneous injectable and oral formulations.',
    ARRAY['Superior weight loss (up to 14.7% in Phase 2 trials)', 'Once-weekly convenient dosing', 'Dual GIP/GLP-1 mechanism for broader metabolic effects', 'Reduced cardiovascular risk markers', 'Improved insulin sensitivity and blood glucose control', 'Available in injectable and oral tablet forms'],
    ARRAY['Nausea (especially during titration)', 'Vomiting', 'Diarrhea', 'Constipation', 'Decreased appetite', 'Injection site reactions (injectable form)', 'Fatigue'],
    ARRAY['Currently investigational — not FDA approved', 'Not available by prescription; clinical trial use only', 'Same thyroid tumor warning class as GLP-1 agonists', 'Pancreatitis risk', 'Gallbladder disease risk', 'Avoid in pregnancy'],
    '2.5–15mg weekly (injectable, Phase 2 range)',
    '[{"name":"Phase 2 Clinical Titration (Injectable)", "level":"Research", "description":"Dose escalation used in VENTURE Phase 2 trial", "schedule":[{"week":"1-4","dose":"2.5mg","frequency":"Once weekly","notes":"Starting dose for tolerability"},{"week":"5-8","dose":"5mg","frequency":"Once weekly","notes":"Escalate if tolerated"},{"week":"9-12","dose":"10-15mg","frequency":"Once weekly","notes":"Target therapeutic range"}], "duration":"Ongoing per trial protocol", "notes":"Investigational compound. For educational reference only. Do not attempt without physician supervision."}]'::jsonb
),

(
    'Amycretin',
    'Dual GLP-1/Amylin Agonist',
    168,
    'An investigational unimolecular dual agonist targeting both GLP-1 and amylin receptors, developed by Novo Nordisk. Amylin is a co-secreted hormone with insulin that regulates appetite, gastric emptying, and glucagon. Available in subcutaneous injectable (once-weekly) and oral (once-daily) formulations. Phase 3 trials (AMETHYST program) are underway following Phase 2 results showing up to 22% weight loss over 36 weeks.',
    ARRAY['Exceptional weight loss (up to 22% in Phase 2 at 36 weeks)', 'Dual mechanism: GLP-1 + amylin for enhanced satiety', 'Once-weekly injectable or once-daily oral option', 'Improved blood glucose and lipid profiles', 'Reduced cardiovascular risk factors', 'Phase 3 development underway'],
    ARRAY['Nausea and vomiting (dose-dependent)', 'Diarrhea', 'Constipation', 'Decreased appetite', 'Fatigue', 'Injection site reactions', 'Heart rate increase (mild)'],
    ARRAY['Investigational — not FDA approved', 'Clinical trial use only', 'Thyroid C-cell tumor warning (class effect)', 'Pancreatitis risk', 'Gallbladder disease risk', 'Contraindicated in pregnancy'],
    '5–20mg weekly (injectable, Phase 2 range)',
    '[{"name":"Phase 2 Clinical Protocol (Injectable)", "level":"Research", "description":"Escalation used in Novo Nordisk Phase 1b/2a trial", "schedule":[{"week":"1-4","dose":"1.25mg","frequency":"Once weekly","notes":"Tolerability starting dose"},{"week":"5-8","dose":"5mg","frequency":"Once weekly"},{"week":"9+","dose":"20mg","frequency":"Once weekly","notes":"High-dose arm evaluated in trial"}], "duration":"As per clinical protocol", "notes":"Investigational only. For educational reference."}]'::jsonb
),

(
    'Danuglipron',
    'GLP-1 Agonist (Oral Small Molecule)',
    12,
    'An investigational oral, small-molecule GLP-1 receptor agonist developed by Pfizer. Unlike peptide-based GLP-1s, Danuglipron is a non-peptide small molecule taken as a pill twice daily. It binds to and activates the GLP-1 receptor to reduce appetite and improve blood sugar control. Pfizer has continued development of optimized formulations following initial Phase 2 results.',
    ARRAY['Oral pill format — no injections required', 'GLP-1 receptor activation for appetite suppression', 'Significant weight loss in clinical trials', 'Improved glycemic control', 'Twice-daily oral dosing', 'Non-peptide structure for better oral bioavailability'],
    ARRAY['Nausea (very common, especially at start)', 'Vomiting', 'Diarrhea', 'Decreased appetite', 'Heartburn or reflux', 'Constipation'],
    ARRAY['Investigational — not FDA approved', 'Clinical development only', 'GI side effects more pronounced than injectable GLP-1s in early trials', 'Pancreatitis risk (class effect)', 'Thyroid C-cell tumor risk (theoretical, class effect)', 'Not for use in pregnancy'],
    '120mg twice daily (Phase 2 range)',
    '[{"name":"Twice-Daily Oral Protocol", "level":"Research", "description":"Phase 2 once-daily optimized formulation", "schedule":[{"week":"1-4","dose":"40mg","frequency":"Twice daily","notes":"Starting dose with food"},{"week":"5+","dose":"120mg","frequency":"Twice daily","notes":"Target dose per Phase 2"}], "duration":"As per protocol", "notes":"Investigational compound — educational reference only."}]'::jsonb
),

(
    'Tirzepatide/B12 Compound',
    'Compound Blend',
    120,
    'A compounded formulation pairing Tirzepatide (a dual GIP/GLP-1 receptor agonist) with Methylcobalamin (Vitamin B12). The B12 component is added to help offset fatigue, anemia risk, and potential neurological side effects associated with extended GLP-1 use and reduced food intake. Commonly prescribed by weight loss clinics.',
    ARRAY['Dual GIP/GLP-1 weight loss mechanism (superior to GLP-1 alone)', 'B12 supplementation mitigates fatigue and energy dip', 'May reduce risk of B12 deficiency from reduced dietary intake', 'Improved mood and energy levels alongside weight loss', 'Convenient single injection contains both compounds'],
    ARRAY['Nausea and vomiting (Tirzepatide component)', 'Diarrhea or constipation', 'Injection site reactions', 'Decreased appetite', 'Fatigue (reduced by B12)', 'Mild B12-related flushing (rare)'],
    ARRAY['Not identical to FDA-approved Mounjaro/Zepbound', 'Compounded from 503A/503B pharmacies only', 'Same thyroid C-cell and pancreatitis warnings as Tirzepatide', 'Avoid in pregnancy', 'Consult prescribing physician for dosing'],
    '2.5–15mg weekly (Tirzepatide dose)',
    '[{"name":"Standard Compounded Titration", "level":"Beginner to Advanced", "description":"Typical compounding pharmacy escalation schedule", "schedule":[{"week":"1-4","dose":"2.5mg + B12","frequency":"Once weekly","notes":"Starting dose, subcutaneous injection"},{"week":"5-8","dose":"5mg + B12","frequency":"Once weekly","notes":"Escalate if tolerated well"},{"week":"9-12","dose":"7.5mg + B12","frequency":"Once weekly","notes":"Continue escalation based on response"},{"week":"13+","dose":"10-15mg + B12","frequency":"Once weekly","notes":"Maintenance phase"}], "duration":"Ongoing with medical supervision", "notes":"B12 dose varies by compound (typically 1000–2000mcg per injection). Use under physician supervision."}]'::jsonb
),

-- ===================== BLENDS / STACKS =====================
(
    'CJC-1295 + Ipamorelin Blend',
    'Growth Hormone Stack',
    2,
    'The most commonly prescribed growth hormone optimization stack, combining CJC-1295 (a GHRH analogue that extends GH pulse duration) with Ipamorelin (a selective GHRP that amplifies GH pulse size). Together they work synergistically — CJC-1295 stimulates the pituitary to release GH for longer, while Ipamorelin triggers a strong, clean GH pulse without significantly raising cortisol or prolactin.',
    ARRAY['Synergistic GH release — significantly more effective than either peptide alone', 'Improved lean muscle mass and body composition', 'Enhanced fat loss, especially visceral fat', 'Better sleep quality and recovery', 'Increased IGF-1 levels', 'Anti-aging effects: skin quality, joint health, energy', 'Low cortisol/prolactin impact (Ipamorelin is selective)', 'Reduced injection frequency vs GHRP alone'],
    ARRAY['Water retention (mild)', 'Numbness or tingling (transient)', 'Headache (mild)', 'Injection site irritation', 'Elevated fasting glucose (mild, monitor)', 'Fatigue on initiation'],
    ARRAY['Not for use with active malignancy', 'Monitor IGF-1 levels — avoid excessive elevation', 'May affect blood glucose in diabetics', 'Not recommended during pregnancy', 'Use pulsatile (not continuous) dosing to preserve pituitary sensitivity'],
    'CJC-1295: 100–300mcg + Ipamorelin: 100–300mcg per injection',
    '[{"name":"Nighttime Recovery Protocol", "level":"Beginner", "description":"Classic protocol — single nightly injection to capitalize on natural GH release during sleep", "schedule":[{"week":"1-12","dose":"100mcg CJC-1295 + 100mcg Ipamorelin","frequency":"Once daily at bedtime","notes":"Inject 30–60 minutes before sleep on empty stomach"}], "duration":"12 weeks on, 4 weeks off", "notes":"Most popular entry protocol. Maintains pituitary health with single daily pulse."}, {"name":"3x Daily Performance Protocol", "level":"Intermediate to Advanced", "description":"Multiple daily pulses for accelerated body recomposition", "schedule":[{"week":"1-12","dose":"200mcg CJC-1295 + 200mcg Ipamorelin","frequency":"3x daily (fasted AM, pre-workout, bedtime)","notes":"Space injections at least 3 hours apart. Must be fasted for AM and bedtime doses."}], "duration":"12 weeks on, 4 weeks off", "notes":"Produces significantly more GH release. Requires stricter fasting protocol around injections."}]'::jsonb
),

(
    'Tesamorelin + Ipamorelin Stack',
    'Growth Hormone Stack',
    1,
    'A targeted growth hormone stack combining Tesamorelin (an FDA-approved GHRH analogue clinically proven to reduce visceral adipose tissue) with Ipamorelin (a selective GHRP). Tesamorelin provides powerful, pulsatile GHRH signaling while Ipamorelin amplifies the GH pulse without the appetite stimulation and cortisol spikes of older GHRPs. Particularly effective for visceral fat reduction and body recomposition.',
    ARRAY['Clinically proven visceral fat reduction (Tesamorelin FDA-approved for this)', 'Amplified GH release vs either peptide alone', 'Improved body composition without significant muscle mass changes', 'Potential cognitive benefits from Tesamorelin', 'Clean GH pulse — minimal cortisol or prolactin impact', 'Better sleep quality', 'Enhanced recovery'],
    ARRAY['Injection site reactions', 'Joint pain or stiffness', 'Water retention', 'Numbness or tingling', 'Mild hyperglycemia', 'Headache'],
    ARRAY['Monitor IGF-1 and blood glucose', 'Not for use with active malignancy', 'Avoid in pregnancy', 'Tesamorelin alone is FDA-approved for HIV-related lipodystrophy only — off-label use for body composition', 'Use under medical supervision'],
    'Tesamorelin: 1–2mg + Ipamorelin: 100–300mcg per injection',
    '[{"name":"Visceral Fat Reduction Protocol", "level":"Intermediate", "description":"Nightly stack targeting visceral and subcutaneous fat with clean GH release", "schedule":[{"week":"1-24","dose":"1mg Tesamorelin + 200mcg Ipamorelin","frequency":"Once daily at bedtime","notes":"Subcutaneous injection. Inject on empty stomach before sleep."}], "duration":"12–24 weeks", "notes":"Tesamorelin effects on visceral fat peak at 3–6 months. IGF-1 monitoring recommended every 4–8 weeks."}]'::jsonb
),

(
    'BPC-157 + KPV + GHK-Cu Stack',
    'Healing & Anti-Inflammatory Stack',
    4,
    'A comprehensive tissue repair and anti-inflammatory stack combining three complementary peptides: BPC-157 (broad-spectrum healing and gut repair), KPV (a powerful anti-inflammatory tripeptide derived from alpha-MSH), and GHK-Cu (a copper peptide that stimulates collagen synthesis, wound healing, and tissue remodeling). Together they address healing from multiple biological angles.',
    ARRAY['Comprehensive soft tissue repair', 'Potent anti-inflammatory action (KPV targets NF-κB pathway)', 'Enhanced collagen and elastin production (GHK-Cu)', 'Gut barrier repair and leaky gut support (BPC-157)', 'Synergistic wound healing acceleration', 'Joint, tendon, and ligament recovery', 'Skin health and regeneration (GHK-Cu)', 'Immune modulation (KPV)'],
    ARRAY['Generally well-tolerated', 'Mild injection site reactions', 'Nausea (BPC-157, rare)', 'Temporary skin darkening at GHK-Cu injection site', 'Dizziness (rare, BPC-157)'],
    ARRAY['Limited human clinical trial data', 'Long-term safety of combination not established', 'Consult physician if on blood thinners (BPC-157)', 'Research compounds — not FDA approved for human use'],
    'BPC-157: 250mcg, KPV: 100–500mcg, GHK-Cu: 1–2mg per injection',
    '[{"name":"Full-Spectrum Healing Protocol", "level":"Intermediate", "description":"Comprehensive daily stack for injury, inflammation, or systemic repair", "schedule":[{"week":"1-8","dose":"250mcg BPC-157 + 250mcg KPV + 1mg GHK-Cu","frequency":"Once or twice daily","notes":"Subcutaneous injection. Can inject near injury site for localized effect."}], "duration":"8–12 weeks", "notes":"BPC-157 and KPV can be taken orally for gut-specific issues. GHK-Cu is more effective subcutaneously for systemic effects."}]'::jsonb
),

(
    'Semax + Selank Stack',
    'Cognitive & Anxiolytic Stack',
    1,
    'A popular nootropic and adaptogenic stack combining Semax (a synthetic ACTH analogue that boosts BDNF, dopamine, and serotonin) with Selank (a synthetic analogue of Tuftsin that acts as an anxiolytic and immune modulator). Together they provide focused cognitive enhancement without anxiety or overstimulation — often described as "calm clarity." Widely used in Russia and gaining popularity globally.',
    ARRAY['Enhanced focus, memory, and cognitive performance (Semax)', 'Anxiety reduction and stress modulation (Selank)', 'Synergistic BDNF elevation (Semax)', 'Improved mood without sedation', 'Immune modulation and anti-inflammatory (Selank)', 'No jitteriness or overstimulation', 'Neuroprotective effects', 'May reduce brain fog'],
    ARRAY['Mild nasal irritation (intranasal route)', 'Headache (mild, infrequent)', 'Fatigue at higher doses (rare)', 'Mild blood pressure changes (Semax, rare)', 'Altered appetite (Selank, rare)'],
    ARRAY['Limited long-term human data', 'Not FDA approved', 'Avoid in pregnancy', 'Use cautiously if on antidepressants or anxiolytics', 'Intranasal dosing preferred for both — avoid IV use outside clinical settings'],
    'Semax: 100–900mcg/day, Selank: 250–3000mcg/day (intranasal)',
    '[{"name":"Daily Cognitive Enhancement Protocol", "level":"Beginner", "description":"Intranasal dosing for balanced focus and anxiety reduction", "schedule":[{"week":"1-4","dose":"200mcg Semax + 500mcg Selank","frequency":"Once daily in the morning (intranasal)","notes":"Split dose across both nostrils. Use on fasted or non-fasted state."},{"week":"5-8","dose":"400mcg Semax + 1000mcg Selank","frequency":"Once to twice daily (morning, and optional midday)","notes":"Increase if well tolerated. Avoid late afternoon dosing."}], "duration":"4–8 weeks, then cycle off 2–4 weeks", "notes":"Tolerance develops gradually. Cycling is recommended. Many users report effects within 1–2 days."}]'::jsonb
),

(
    'MOTS-c + SS-31 Stack',
    'Mitochondrial Longevity Stack',
    2,
    'A powerful mitochondrial optimization stack combining MOTS-c (a mitochondrial-derived peptide that regulates metabolic function and mimics exercise effects) with SS-31/Elamipretide (a mitochondria-targeting peptide that reduces oxidative stress and restores mitochondrial membrane potential). Together they address mitochondrial dysfunction from multiple angles, making this a leading longevity and metabolic health protocol.',
    ARRAY['Dual mitochondrial support — energy production and oxidative protection', 'Improved insulin sensitivity and glucose metabolism (MOTS-c)', 'Enhanced cellular energy (ATP) production', 'Reduced mitochondrial reactive oxygen species (SS-31)', 'Exercise mimetic effects (MOTS-c)', 'Potential cardiovascular protection (SS-31)', 'Anti-aging at the cellular level', 'Improved physical performance and endurance'],
    ARRAY['Generally well-tolerated', 'Mild injection site reactions', 'Fatigue on initiation (brief, rare)', 'Nausea (rare)', 'Headache (rare)'],
    ARRAY['Research compounds — not FDA approved for general use (SS-31 in clinical trials for rare diseases)', 'Limited long-term human data', 'Use under medical supervision', 'Avoid in pregnancy'],
    'MOTS-c: 5–15mg weekly, SS-31: 0.25–1mg daily',
    '[{"name":"Longevity Mitochondrial Protocol", "level":"Intermediate", "description":"Weekly MOTS-c combined with daily SS-31 for comprehensive mitochondrial support", "schedule":[{"week":"1-12","dose":"10mg MOTS-c once weekly + 0.5mg SS-31 once daily","frequency":"Weekly MOTS-c (subcutaneous), daily SS-31 (subcutaneous)","notes":"MOTS-c inject once weekly in the morning. SS-31 inject daily, ideally in the morning."}], "duration":"12 weeks on, 4 weeks off", "notes":"Results accumulate over 4–8 weeks. Best combined with consistent exercise for maximal metabolic benefit."}]'::jsonb
),

(
    'Thymalin + Epithalon Stack',
    'Immune & Longevity Stack',
    4,
    'A synergistic anti-aging and immune optimization stack combining Thymalin (a polypeptide extract of the thymus gland that restores thymic function and immune competence) with Epithalon/Epitalon (a tetrapeptide derived from the pineal gland that activates telomerase, extends telomere length, and regulates melatonin). Extensively studied in Russian longevity research, this stack addresses two key pillars of aging: immune decline and telomere shortening.',
    ARRAY['Immune system restoration and thymic rejuvenation (Thymalin)', 'Telomerase activation and telomere extension (Epithalon)', 'Improved melatonin production and sleep quality (Epithalon)', 'Anti-cancer immune surveillance enhancement', 'Antioxidant protection', 'Improved T-cell and NK-cell function', 'May reduce biological age markers', 'Circadian rhythm regulation'],
    ARRAY['Generally very well tolerated', 'Mild injection site discomfort', 'Brief fatigue on initiation (rare)', 'Allergic reactions (rare, especially with Thymalin)'],
    ARRAY['Mainly studied in Russian clinical literature — limited Western peer-reviewed trials', 'Not FDA approved', 'Avoid in autoimmune conditions (Thymalin may stimulate immune activity)', 'Avoid in pregnancy', 'Consult physician before use with immunosuppressive medications'],
    'Thymalin: 5–10mg daily, Epithalon: 5–10mg daily (cyclically)',
    '[{"name":"Annual Longevity Protocol", "level":"Advanced", "description":"Short-course annual treatment used in Russian anti-aging research", "schedule":[{"week":"1-2","dose":"5mg Thymalin + 10mg Epithalon","frequency":"Once daily (subcutaneous or IM)","notes":"10-day intensive course. Day 1–10. Can repeat 1–2x annually."}], "duration":"10 days (repeated 1–2x per year)", "notes":"Protocol modeled after clinical studies conducted at St. Petersburg Institute of Bioregulation and Gerontology. Most data is from Russian literature."}]'::jsonb
),

(
    'Semaglutide + BPC-157 Stack',
    'Metabolic & Healing Stack',
    96,
    'A compounded combination stack pairing Semaglutide (a GLP-1 receptor agonist for weight loss and blood sugar control) with BPC-157 (a healing and gut-protective peptide). This stack is increasingly prescribed at weight-loss clinics to mitigate the GI side effects of Semaglutide — particularly nausea, gut motility issues, and intestinal inflammation — while providing the metabolic benefits of the GLP-1 agonist.',
    ARRAY['Significant weight loss (GLP-1 mechanism)', 'Reduced GI side effects from Semaglutide (BPC-157 gut protection)', 'Gut barrier integrity support (BPC-157)', 'Anti-inflammatory gut lining repair', 'Improved tolerability of Semaglutide titration', 'Blood sugar regulation', 'Reduced nausea and gastroparesis symptoms'],
    ARRAY['Nausea (Semaglutide dominant, mitigated by BPC-157)', 'Diarrhea or constipation', 'Injection site reactions', 'Fatigue', 'Headache'],
    ARRAY['Not an FDA-approved combination', 'Compounded BPC-157 regulatory status varies by state', 'Same thyroid/pancreatitis warnings as Semaglutide', 'BPC-157 long-term safety not established', 'Use under physician supervision'],
    'Semaglutide: per standard titration, BPC-157: 200–500mcg daily',
    '[{"name":"GLP-1 + Gut Protection Protocol", "level":"Beginner to Intermediate", "description":"Standard Semaglutide titration with concurrent BPC-157 for GI support", "schedule":[{"week":"1-4","dose":"0.25mg Semaglutide weekly + 250mcg BPC-157 daily","frequency":"Semaglutide weekly, BPC-157 daily subcutaneous","notes":"Take BPC-157 with or without food. Oral BPC-157 can target gut specifically."},{"week":"5-8","dose":"0.5mg Semaglutide weekly + 250mcg BPC-157 daily","frequency":"Continue same schedule"},{"week":"9+","dose":"1mg+ Semaglutide per protocol + 250mcg BPC-157 daily","frequency":"Continue BPC-157 during entire Semaglutide course"}], "duration":"Per Semaglutide protocol + BPC-157 concurrent", "notes":"Many users discontinue BPC-157 once GI tolerance improves."}]'::jsonb
),

(
    'LL-37 + GHK-Cu Stack',
    'Immune & Skin Regeneration Stack',
    2,
    'A synergistic skin health and immune support stack combining LL-37 (cathelicidin — the body''s primary antimicrobial peptide with potent anti-biofilm and wound-healing properties) with GHK-Cu (a copper tripeptide that stimulates collagen synthesis, promotes tissue repair, and has documented anti-inflammatory and wound-healing effects). Together they offer broad-spectrum skin regeneration, infection protection, and anti-aging benefits.',
    ARRAY['Broad-spectrum antimicrobial protection (LL-37)', 'Collagen and elastin synthesis (GHK-Cu)', 'Wound healing acceleration', 'Anti-biofilm activity — useful for resistant infections', 'Skin regeneration and anti-aging', 'Anti-inflammatory synergy', 'Immune modulation', 'Hair follicle stimulation (GHK-Cu)'],
    ARRAY['Injection site redness or irritation', 'Mild skin sensitivity', 'LL-37 can cause temporary pain at injection site', 'GHK-Cu may cause temporary local skin darkening'],
    ARRAY['LL-37 research compound — not FDA approved', 'Use caution in autoimmune skin conditions', 'Avoid on broken or infected skin without medical oversight', 'Limited long-term human data for combination use'],
    'LL-37: 100–500mcg, GHK-Cu: 1–2mg per injection',
    '[{"name":"Skin & Immune Restoration Protocol", "level":"Intermediate", "description":"Subcutaneous injections for skin regeneration, wound healing, and immune support", "schedule":[{"week":"1-8","dose":"200mcg LL-37 + 1mg GHK-Cu","frequency":"Once daily subcutaneous (or topical GHK-Cu)", "notes":"Can inject near skin lesions or areas of concern. GHK-Cu also effective as topical serum."}], "duration":"8 weeks", "notes":"Can be continued longer at reduced frequency (3x/week) for maintenance. GHK-Cu topical formulations widely available and complement injectable protocol."}]'::jsonb
),

-- ===================== COSMETIC / SKIN =====================
(
    'Palmitoyl Oligopeptide',
    'Anti-Aging & Skin',
    2,
    'A synthetic lipopeptide (Pal-KTTKS precursor fragment) used extensively in cosmeceutical skin care formulations. Palmitoyl Oligopeptide signals fibroblasts to produce more collagen I and fibronectin, reducing the appearance of fine lines and wrinkles. It is a key component of many premium anti-aging serums and creams, often paired with Palmitoyl Tetrapeptide-7 (as Matrixyl 3000).',
    ARRAY['Stimulates collagen I and fibronectin production', 'Visibly reduces fine lines and wrinkles', 'Improves skin firmness and elasticity', 'Works synergistically with other Matrixyl-family peptides', 'Excellent safety profile for topical use', 'Widely validated in cosmeceutical research'],
    ARRAY['Generally extremely well tolerated topically', 'Rare contact allergy (patch test recommended)', 'Mild skin sensitivity in some individuals'],
    ARRAY['Primarily designed for topical cosmeceutical use', 'Not approved for injectable use', 'Effects require 4–12 weeks of consistent topical application to become visible', 'Efficacy is concentration-dependent'],
    'Topical: 0.5–5% concentration in serum or cream',
    '[{"name":"Anti-Aging Topical Protocol", "level":"Beginner", "description":"Daily topical application to face, neck, and décolletage", "schedule":[{"week":"1-12","dose":"1–3% concentration serum","frequency":"Once or twice daily topically","notes":"Apply to clean skin after toning, before moisturizer. AM and PM use preferred."}], "duration":"12+ weeks for measurable effects", "notes":"Best combined with Palmitoyl Tetrapeptide-7 (Matrixyl 3000 formula), Vitamin C, and daily SPF for maximum anti-aging efficacy."}]'::jsonb
),

-- ===================== LONGEVITY / MITOCHONDRIAL =====================
(
    'Klotho Peptide Fragment',
    'Longevity & Anti-Aging',
    8,
    'A bioactive peptide fragment derived from the Klotho protein — a potent anti-aging longevity gene product. Klotho deficiency is associated with accelerated aging, cognitive decline, kidney disease, and cardiovascular dysfunction. Klotho peptide fragments (particularly those mimicking the KL1 domain) are being researched for their ability to improve cognition, protect the kidneys, reduce systemic inflammation, and extend healthspan.',
    ARRAY['Neuroprotective effects — improves memory and cognitive function', 'Kidney protection and anti-fibrotic effects', 'Cardiovascular protection', 'Reduces systemic inflammation', 'Potential extension of healthspan', 'Antioxidant activity', 'Improves synaptic plasticity and NMDA receptor function'],
    ARRAY['Research compound with limited human safety data', 'Injection site reactions', 'Mild fatigue on initiation (anecdotal)', 'Headache (rare)'],
    ARRAY['Highly experimental — no established clinical protocol', 'Not FDA approved for any indication', 'Most research is preclinical (animal models)', 'Use only under close medical supervision', 'Do not use in pregnancy', 'Long-term effects in humans unknown'],
    '0.1–1mg (investigational, varies widely)',
    '[{"name":"Experimental Research Protocol", "level":"Advanced", "description":"Investigational dosing based on preclinical and early human studies", "schedule":[{"week":"1+","dose":"0.1–0.5mg","frequency":"2–3x weekly (subcutaneous)","notes":"Conservative starting dose. No established human protocol exists."}], "duration":"Investigational", "notes":"All human use is experimental. Monitor closely and work with a physician. Most knowledge comes from animal studies."}]'::jsonb
),

(
    'Humanin Analog (HNG)',
    'Mitochondrial & Longevity Peptide',
    6,
    'Humanin G (HNG, Ser14G-Humanin) is a potent S14G-substituted analog of Humanin — a mitochondria-derived peptide that protects against Alzheimer''s disease, ischemia, diabetes, and aging-related cellular stress. The Gly14→Ser substitution makes HNG approximately 1000x more potent than native Humanin. HNG activates multiple cytoprotective pathways including STAT3, MEK/ERK, and IGF-1 signaling.',
    ARRAY['~1000x more potent than native Humanin', 'Neuroprotection against Alzheimer''s disease models', 'Cytoprotection against ischemia and cellular stress', 'Improved insulin sensitivity', 'Anti-apoptotic in neurons, cardiomyocytes, and beta-cells', 'STAT3/JAK activation for broad cytoprotection', 'Mitochondrial preservation', 'Potential cardiovascular protection'],
    ARRAY['Largely unknown side effect profile in humans (limited clinical data)', 'Injection site reactions (mild)', 'Headache (rare)', 'Nausea (rare at higher doses)'],
    ARRAY['Highly experimental compound', 'Most research preclinical (in vitro and animal models)', 'Not FDA approved', 'No established human dosing protocol', 'Use only under physician supervision', 'Do not use in pregnancy'],
    '2–10mg weekly (investigational)',
    '[{"name":"Neuroprotection Research Protocol", "level":"Advanced", "description":"Conservative investigational dosing based on preclinical data", "schedule":[{"week":"1+","dose":"2–5mg","frequency":"Once or twice weekly (subcutaneous)","notes":"Highly investigational. No established human standard exists."}], "duration":"Investigational", "notes":"Based entirely on animal studies and in vitro data. Human safety profile not established. Proceed only under medical supervision."}]'::jsonb
),

-- ===================== HORMONAL / FERTILITY =====================
(
    'Kisspeptin-54',
    'Hormone & Fertility',
    1,
    'The full-length form of Kisspeptin containing 54 amino acids (also called metastin). Kisspeptin-54 is the predominant circulating form of Kisspeptin and acts as the master regulator of the hypothalamic-pituitary-gonadal (HPG) axis by binding to GPR54/KISS1R receptors and triggering GnRH release. Used clinically in IVF protocols and researched for hypogonadism, infertility in both sexes, and testosterone optimization.',
    ARRAY['Potent stimulation of GnRH → LH → testosterone/estrogen axis', 'Clinically used in IVF ovulation triggering protocols', 'More physiological LH surge than hCG (reduces OHSS risk)', 'Does not suppress HPG axis (unlike exogenous testosterone)', 'Female fertility stimulation', 'Male hypogonadism research (testosterone restoration)', 'Libido enhancement research'],
    ARRAY['Abdominal bloating or discomfort', 'Hot flashes (women)', 'Mild nausea', 'Headache', 'Flushing', 'Injection site reactions'],
    ARRAY['Use only under reproductive endocrinologist or fertility specialist supervision', 'Not for use outside clinical or research settings', 'Not for use in hormone-sensitive cancers', 'Dosing is highly individualized by clinical context', 'Do not use in pregnancy outside closely monitored IVF protocols'],
    '1.6–9.6nmol/kg IV or SC (clinical range, weight-based)',
    '[{"name":"IVF Ovulation Trigger Protocol", "level":"Advanced (Clinical Only)", "description":"Clinical use as an alternative to hCG for ovulation triggering in IVF", "schedule":[{"week":"Trigger Day Only","dose":"1.6–9.6nmol/kg","frequency":"Single injection 34–38 hours before egg retrieval","notes":"Precise timing critical. Must be administered in clinical setting under specialist care."}], "duration":"Single administration per IVF cycle", "notes":"Preferred over hCG in high-OHSS-risk patients. Specialist supervision mandatory. Not for self-administration."}]'::jsonb
),

-- ===================== GH / LONGEVITY =====================
(
    'Lonapegsomatropin (TransCon hGH)',
    'Growth Hormone Therapy',
    168,
    'Lonapegsomatropin (brand name: Skytrofa) is an FDA-approved once-weekly long-acting growth hormone therapy using TransCon technology — pegylated recombinant human GH that releases active hGH gradually over 7 days. It provides equivalent GH replacement to daily injections with far greater convenience. Approved for pediatric GH deficiency, with adult GH deficiency trials ongoing.',
    ARRAY['FDA-approved long-acting GH therapy', 'Once-weekly injection replaces daily injections', 'TransCon technology provides gradual, sustained GH release', 'Non-inferior efficacy to daily somatropin', 'Improved patient compliance', 'Physiological GH release mimicry', 'Height velocity improvements in pediatric GHD', 'Improved body composition in adults (off-label research)'],
    ARRAY['Injection site reactions (erythema, pain, swelling)', 'Headache', 'Hypothyroidism (monitor thyroid function)', 'Peripheral edema', 'Arthralgia', 'Glucose tolerance changes'],
    ARRAY['FDA-approved for pediatric GHD only — adult use is off-label', 'Not FDA-approved for anti-aging or body composition', 'May exacerbate active malignancy', 'Contraindicated in Prader-Willi syndrome with severe obesity', 'Monitor IGF-1, glucose, and thyroid during therapy', 'Prescription only'],
    '0.24mg/kg once weekly (pediatric GHD dose)',
    '[{"name":"Pediatric GHD Standard Protocol (FDA-Approved)", "level":"Clinical", "description":"FDA-approved dosing for pediatric growth hormone deficiency", "schedule":[{"week":"1+","dose":"0.24mg/kg","frequency":"Once weekly subcutaneous injection","notes":"Same day each week. Rotate injection sites. Dose adjusted based on growth velocity and IGF-1 monitoring."}], "duration":"Until epiphyseal closure or goal achieved", "notes":"Requires prescribing physician, diagnostic confirmation of GHD, and regular IGF-1/growth monitoring. Not for self-administration."}]'::jsonb
)

ON CONFLICT (name) DO NOTHING;
