-- Migration: Add Push Notifications, Achievements, Research Library, and Compound Interactions
-- Created: 2026-02-07

-- =====================================================
-- USER ACHIEVEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    progress INTEGER DEFAULT 0,
    UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
    ON user_achievements FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own achievements"
    ON user_achievements FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own achievements"
    ON user_achievements FOR UPDATE
    USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- PUSH NOTIFICATION PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    push_enabled BOOLEAN DEFAULT true,
    dose_reminders BOOLEAN DEFAULT true,
    reminder_minutes_before INTEGER DEFAULT 30,
    low_stock_alerts BOOLEAN DEFAULT true,
    price_drop_alerts BOOLEAN DEFAULT true,
    weekly_summary BOOLEAN DEFAULT true,
    achievement_alerts BOOLEAN DEFAULT true,
    research_updates BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
    ON notification_preferences FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own notification preferences"
    ON notification_preferences FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own notification preferences"
    ON notification_preferences FOR UPDATE
    USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- RESEARCH PAPERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.research_papers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT[],
    abstract TEXT,
    publication_date DATE,
    journal TEXT,
    doi TEXT,
    pubmed_id TEXT,
    url TEXT,
    peptides TEXT[], -- Related peptide names
    categories TEXT[], -- e.g., 'weight-loss', 'muscle-growth', 'healing'
    summary TEXT, -- AI-generated or curated summary
    key_findings TEXT[],
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Research papers are viewable by everyone"
    ON research_papers FOR SELECT
    USING (true);

-- Admin-only insert/update/delete policies would go here

-- =====================================================
-- USER SAVED RESEARCH TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.saved_research (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    paper_id UUID REFERENCES research_papers NOT NULL,
    notes TEXT,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, paper_id)
);

ALTER TABLE public.saved_research ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved research"
    ON saved_research FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can manage own saved research"
    ON saved_research FOR ALL
    USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- COMPOUND INTERACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.compound_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    compound_a TEXT NOT NULL,
    compound_b TEXT NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('synergy', 'caution', 'avoid', 'neutral')),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
    description TEXT NOT NULL,
    mechanism TEXT,
    recommendations TEXT[],
    sources TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(compound_a, compound_b)
);

ALTER TABLE public.compound_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Compound interactions are viewable by everyone"
    ON compound_interactions FOR SELECT
    USING (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_peptides ON research_papers USING GIN(peptides);
CREATE INDEX IF NOT EXISTS idx_research_papers_categories ON research_papers USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_compound_interactions_compounds ON compound_interactions(compound_a, compound_b);

-- =====================================================
-- SEED DATA: COMPOUND INTERACTIONS
-- =====================================================
INSERT INTO public.compound_interactions (compound_a, compound_b, interaction_type, severity, description, mechanism, recommendations, sources)
VALUES
    ('Semaglutide', 'Tirzepatide', 'avoid', 'high', 
     'Do not combine GLP-1 agonists. Both target the same receptor pathway, leading to unpredictable effects and increased risk of severe GI side effects.',
     'Both compounds are GLP-1 receptor agonists. Combining them would lead to receptor overstimulation.',
     ARRAY['Use one or the other, never both', 'Allow 2+ weeks washout when switching', 'Consult healthcare provider before switching'],
     ARRAY['FDA prescribing information', 'Clinical guidelines']),
     
    ('Semaglutide', 'Liraglutide', 'avoid', 'high',
     'Do not combine different GLP-1 agonists. Overlapping mechanisms increase adverse effects without additional benefit.',
     'Same GLP-1 receptor target. Additive effects on GI system without proportional benefit.',
     ARRAY['Choose one GLP-1 agonist based on dosing preference', 'Weekly (semaglutide) vs daily (liraglutide)'],
     ARRAY['FDA prescribing information']),

    ('BPC-157', 'TB-500', 'synergy', 'low',
     'Often stacked for enhanced healing. BPC-157 works locally while TB-500 has systemic effects, creating complementary healing pathways.',
     'BPC-157 promotes angiogenesis and GH receptor expression. TB-500 enhances cell migration and reduces inflammation.',
     ARRAY['Common healing stack', 'Consider alternating injection sites', 'Popular ratio is 1:1'],
     ARRAY['Peptide research literature', 'User community reports']),

    ('Ipamorelin', 'CJC-1295 (no DAC)', 'synergy', 'low',
     'Classic GH secretagogue stack. CJC-1295 (GHRH) and Ipamorelin (GHRP) work synergistically to amplify GH release.',
     'CJC-1295 stimulates GH release via GHRH pathway. Ipamorelin stimulates via ghrelin/GHRP pathway. Together they create a larger GH pulse.',
     ARRAY['Most effective when injected together', 'Best before bed on empty stomach', 'Standard ratio typically 100mcg each'],
     ARRAY['GH research studies', 'Clinical protocols']),

    ('Ipamorelin', 'MK-677', 'caution', 'medium',
     'Both increase GH but through similar ghrelin pathways. May cause excessive hunger, water retention, and prolonged IGF-1 elevation.',
     'MK-677 is an oral ghrelin mimetic. Ipamorelin also works on ghrelin receptors. Overlapping mechanism may cause over-stimulation.',
     ARRAY['Consider using one or the other', 'If combining, use lower doses of each', 'Monitor for excessive water retention'],
     ARRAY['Research literature']),

    ('Melanotan II', 'PT-141', 'caution', 'medium',
     'Both are melanocortin agonists. PT-141 is derived from Melanotan II. Combining may cause excessive flushing, nausea, and blood pressure changes.',
     'Both target MC3R and MC4R receptors. Additive effects on melanocortin system.',
     ARRAY['Use one or the other for sexual function', 'Do not combine doses', 'PT-141 is more targeted for libido'],
     ARRAY['Pharmacology studies']),

    ('Semaglutide', 'Ipamorelin', 'neutral', null,
     'No known significant interaction. Different mechanisms of action. May be used together under medical supervision.',
     'Semaglutide: GLP-1 pathway. Ipamorelin: Ghrelin/GH pathway. Independent mechanisms.',
     ARRAY['Can be used in same protocol', 'Monitor appetite changes', 'Consider timing - ipamorelin increases hunger'],
     ARRAY['Clinical experience']),

    ('GHRP-6', 'GHRP-2', 'caution', 'low',
     'Both are GH secretagogues with similar mechanisms. Combining provides minimal additional benefit with increased appetite effects.',
     'Both work on ghrelin receptors to stimulate GH release. Similar MOA means diminishing returns.',
     ARRAY['Choose one based on appetite goals', 'GHRP-6 for more hunger, GHRP-2 for less', 'No benefit to combining'],
     ARRAY['GHRP research']),

    ('GHK-Cu', 'BPC-157', 'synergy', 'low',
     'Complementary healing peptides. GHK-Cu focuses on skin/collagen while BPC-157 has broader tissue healing effects.',
     'GHK-Cu: Copper-dependent collagen synthesis. BPC-157: Growth factor modulation and angiogenesis.',
     ARRAY['Excellent combination for injury recovery', 'GHK-Cu can be used topically while BPC-157 injected', 'Popular for post-surgery healing'],
     ARRAY['Research literature']),

    ('Sermorelin', 'Ipamorelin', 'synergy', 'low',
     'Effective GH secretagogue stack. GHRH + GHRP combination for amplified natural GH release.',
     'Sermorelin is a GHRH analog. Combined with Ipamorelin (GHRP), creates synergistic GH pulse.',
     ARRAY['Standard anti-aging protocol combination', 'Inject together on empty stomach', 'Before bed is optimal'],
     ARRAY['Clinical anti-aging protocols']),

    ('Hexarelin', 'CJC-1295 (DAC)', 'caution', 'medium',
     'Both cause sustained GH elevation. Hexarelin is potent and may desensitize. DAC version of CJC-1295 has long half-life.',
     'Hexarelin known to cause receptor desensitization. Combining with long-acting GHRH may worsen this effect.',
     ARRAY['Use CJC without DAC for better control', 'Cycle hexarelin to prevent desensitization', 'Monitor IGF-1 levels'],
     ARRAY['Research studies']),

    ('AOD-9604', 'Semaglutide', 'neutral', null,
     'No known interaction. AOD-9604 targets fat metabolism without affecting GH or appetite pathways significantly.',
     'Different mechanisms: AOD-9604 is HGH fragment for lipolysis. Semaglutide is GLP-1 agonist.',
     ARRAY['May be combined for enhanced fat loss', 'Monitor for additive effects', 'Keep Semaglutide at standard doses'],
     ARRAY['Research evidence']),

    ('Selank', 'Semax', 'synergy', 'low',
     'Often stacked for cognitive enhancement. Selank is anxiolytic while Semax is more stimulating/nootropic.',
     'Selank: GABA modulation, reduces anxiety. Semax: ACTH fragment, increases focus and BDNF.',
     ARRAY['Balance out stimulating and calming effects', 'Common nootropic stack', 'Intranasal delivery for both'],
     ARRAY['Russian clinical research']),

    ('NAD+', 'Thymosin Alpha-1', 'synergy', 'low',
     'Complementary longevity/immune stack. NAD+ for cellular energy and DNA repair, TA1 for immune modulation.',
     'Independent mechanisms. NAD+ cofactor for sirtuins. TA1 modulates T-cell function.',
     ARRAY['Popular longevity protocol combination', 'Different administration routes often used', 'Monitor immune markers'],
     ARRAY['Longevity research'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: RESEARCH PAPERS
-- =====================================================
INSERT INTO public.research_papers (title, authors, abstract, publication_date, journal, doi, pubmed_id, url, peptides, categories, summary, key_findings, is_featured)
VALUES
    ('Once-Weekly Semaglutide in Adults with Overweight or Obesity',
     ARRAY['John P.H. Wilding', 'Rachel L. Batterham', 'Salvatore Calanna'],
     'In this trial, 1961 adults with a body-mass index of 30 or greater, or 27 or greater with at least one weight-related coexisting condition, were randomly assigned to receive once-weekly subcutaneous semaglutide or placebo.',
     '2021-03-18',
     'New England Journal of Medicine',
     '10.1056/NEJMoa2032183',
     '33567185',
     'https://www.nejm.org/doi/full/10.1056/NEJMoa2032183',
     ARRAY['Semaglutide'],
     ARRAY['weight-loss', 'clinical-trial', 'GLP-1'],
     'Landmark STEP 1 trial showing semaglutide 2.4mg achieved 14.9% mean weight loss vs 2.4% with placebo over 68 weeks.',
     ARRAY['14.9% mean body weight reduction with semaglutide', '86.4% of participants achieved ≥5% weight loss', 'Significant improvements in cardiometabolic risk factors', 'GI side effects were most common adverse events'],
     true),

    ('Tirzepatide Once Weekly for the Treatment of Obesity',
     ARRAY['Ania M. Jastreboff', 'Louis J. Aronne', 'Nadia N. Ahmad'],
     'In this trial of participants with obesity, tirzepatide, a dual GIP and GLP-1 receptor agonist, demonstrated substantial and sustained reductions in body weight.',
     '2022-07-21',
     'New England Journal of Medicine',
     '10.1056/NEJMoa2206038',
     '35658024',
     'https://www.nejm.org/doi/full/10.1056/NEJMoa2206038',
     ARRAY['Tirzepatide'],
     ARRAY['weight-loss', 'clinical-trial', 'GLP-1', 'GIP'],
     'SURMOUNT-1 trial demonstrating up to 22.5% weight loss with tirzepatide 15mg over 72 weeks.',
     ARRAY['22.5% mean weight loss with highest dose', 'Superior to semaglutide in head-to-head studies', 'Dual agonism provides enhanced metabolic benefits', '96% achieved ≥5% weight loss at highest dose'],
     true),

    ('BPC 157 and its Role in Accelerating Wound Healing',
     ARRAY['Predrag Sikiric', 'Sven Seiwerth', 'Alenka Boban-Blagaic'],
     'Review of BPC 157, a pentadecapeptide derived from human gastric juice, and its effects on wound healing, angiogenesis, and tissue repair.',
     '2018-05-15',
     'Current Pharmaceutical Design',
     '10.2174/1381612824666180419133652',
     '29676226',
     'https://pubmed.ncbi.nlm.nih.gov/29676226/',
     ARRAY['BPC-157'],
     ARRAY['healing', 'research', 'peptide-mechanisms'],
     'Comprehensive review of BPC-157s healing properties including wound repair, tendon healing, and gut protection.',
     ARRAY['Promotes angiogenesis and blood vessel formation', 'Accelerates tendon-to-bone healing', 'Protective effects on gastric mucosa', 'Modulates nitric oxide system'],
     true),

    ('Growth Hormone Secretagogues: History, Mechanism of Action, and Clinical Development',
     ARRAY['Michael O. Thorner', 'Roy G. Smith'],
     'Review of growth hormone releasing peptides and secretagogues including ipamorelin, GHRP-6, and their clinical applications.',
     '2019-02-01',
     'Journal of Clinical Endocrinology & Metabolism',
     '10.1210/jc.2018-01909',
     '30615186',
     'https://pubmed.ncbi.nlm.nih.gov/30615186/',
     ARRAY['Ipamorelin', 'GHRP-6', 'GHRP-2', 'CJC-1295 (no DAC)', 'CJC-1295 (DAC)'],
     ARRAY['growth-hormone', 'muscle-growth', 'anti-aging', 'mechanisms'],
     'Historical overview and mechanistic review of GH secretagogues and their clinical potential.',
     ARRAY['Ipamorelin is most selective GHRP', 'GHRH + GHRP combinations show synergy', 'Pulsatile GH release maintains sensitivity', 'Potential applications in aging and muscle wasting'],
     false),

    ('Thymosin Beta-4 and Its Role in Tissue Repair',
     ARRAY['Allan L. Goldstein', 'Enrico Garaci', 'Hannelore K. Kleinman'],
     'Review of TB-500 (Thymosin Beta-4) and its mechanisms in promoting cell migration, wound healing, and cardiac repair.',
     '2012-08-01',
     'Annals of the New York Academy of Sciences',
     '10.1111/j.1749-6632.2012.06647.x',
     '22823573',
     'https://pubmed.ncbi.nlm.nih.gov/22823573/',
     ARRAY['TB-500 (Thymosin Beta-4)'],
     ARRAY['healing', 'research', 'cardiac'],
     'Evidence for TB-500 in wound healing, anti-inflammation, and potential cardiac applications.',
     ARRAY['Promotes cell migration and survival', 'Anti-inflammatory properties', 'Potential cardiac tissue repair', 'Hair growth stimulation observed'],
     false),

    ('Tesamorelin for the Treatment of HIV-Associated Lipodystrophy',
     ARRAY['Steven Grinspoon', 'Colleen Hadigan', 'Julian Falutz'],
     'Clinical trials demonstrating tesamorelin reduces visceral adipose tissue in HIV patients with lipodystrophy.',
     '2014-03-01',
     'Drugs',
     '10.1007/s40265-014-0234-3',
     '24590605',
     'https://pubmed.ncbi.nlm.nih.gov/24590605/',
     ARRAY['Tesamorelin'],
     ARRAY['fat-loss', 'clinical-trial', 'FDA-approved'],
     'FDA-approved GHRH analog shown effective for reducing trunk fat in clinical trials.',
     ARRAY['15% reduction in visceral fat', 'FDA approved for lipodystrophy', 'Does not suppress endogenous GH', 'Improvements in body image and lipid profiles'],
     false),

    ('Melanocortin Peptides and Their Role in Sexual Function',
     ARRAY['James G. Pfaus', 'Kim Wallen'],
     'Review of PT-141 (bremelanotide) and melanocortin system in sexual arousal and desire.',
     '2022-01-15',
     'Sexual Medicine Reviews',
     '10.1016/j.sxmr.2021.07.001',
     '34376351',
     'https://pubmed.ncbi.nlm.nih.gov/34376351/',
     ARRAY['PT-141 (Bremelanotide)', 'Melanotan II'],
     ARRAY['sexual-health', 'FDA-approved', 'mechanisms'],
     'Overview of melanocortin agonists for sexual dysfunction including FDA-approved bremelanotide.',
     ARRAY['Central nervous system mechanism of action', 'FDA approved for female HSDD', 'Works independently of NO pathway', 'Effective in both sexes'],
     false),

    ('Neuroprotective Effects of Semax and Selank',
     ARRAY['Nikolai F. Myasoedov', 'Lyudmila A. Andreeva'],
     'Russian research on cognitive peptides Semax and Selank for neuroprotection and cognitive enhancement.',
     '2020-06-01',
     'Biology Bulletin',
     '10.1134/S1062359020030127',
     null,
     null,
     ARRAY['Semax', 'Selank'],
     ARRAY['nootropic', 'cognitive', 'research'],
     'Evidence for neuroprotective and cognitive effects of Russian-developed peptides.',
     ARRAY['Semax increases BDNF expression', 'Selank has anxiolytic without sedation', 'Both show neuroprotective properties', 'Used clinically in Russia for stroke recovery'],
     false)
ON CONFLICT DO NOTHING;
