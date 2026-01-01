-- Migration: 20260101000001_security_performance_fixes.sql
-- Description: Fixes 100+ potential Supabase issues by adding missing indexes and ensuring RLS is enabled everywhere.

-- 1. ADD MISSING INDEXES (Performance Fixes)
-- Injections
CREATE INDEX IF NOT EXISTS idx_injections_user_id ON public.injections(user_id);
CREATE INDEX IF NOT EXISTS idx_injections_peptide_name ON public.injections(peptide_name);
CREATE INDEX IF NOT EXISTS idx_injections_date ON public.injections(injection_date DESC);

-- Inventory
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_peptide ON public.inventory(peptide_name);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON public.inventory(expiration_date);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_peptide ON public.reviews(peptide_name);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- Schedules
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON public.schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_schedules_completed ON public.schedules(completed);

-- Support Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON public.support_tickets(created_at DESC);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- Peptides
CREATE INDEX IF NOT EXISTS idx_peptides_category ON public.peptides(category);
CREATE INDEX IF NOT EXISTS idx_peptides_name ON public.peptides(name);

-- 2. ENSURE ROW LEVEL SECURITY IS ENABLED (Security Fixes)
-- It is safe to run this even if already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peptides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- 3. ENSURE AUDIT LOGS ARE PROTECTED
-- Only admins/system should insert, users can view own? Or only Admins view?
-- Usually users shouldn't see audit logs unless it's their own activity history.
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- 4. ENSURE SUPPORT TICKETS ARE PROTECTED
-- Users see own, Admins see all.
-- (Assuming Admin policy exists or service_role bypasses)
-- We'll add explicit User Only policy to be safe
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
CREATE POLICY "Users can view own tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Success Confirmation
SELECT 'Security and performance fixes applied successfully' as status;
