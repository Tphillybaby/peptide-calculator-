-- Migration: 20260101000004_fix_db_linter_issues.sql
-- Description: Fixes duplicate indexes and optimizes RLS policies.

-- 1. DROP DUPLICATE INDEXES
-- Audit Logs
DROP INDEX IF EXISTS idx_audit_logs_action; -- Keep idx_audit_action
DROP INDEX IF EXISTS idx_audit_logs_created_at; -- Keep idx_audit_created
DROP INDEX IF EXISTS idx_audit_logs_user_id; -- Keep idx_audit_user_id

-- Forum Posts
DROP INDEX IF EXISTS idx_forum_posts_topic_fk; -- Keep idx_forum_posts_topic
DROP INDEX IF EXISTS idx_forum_posts_author; -- Keep idx_forum_posts_user

-- Forum Topics
DROP INDEX IF EXISTS idx_forum_topics_category_fk; -- Keep idx_forum_topics_category
DROP INDEX IF EXISTS idx_forum_topics_author; -- Keep idx_forum_topics_user

-- Inventory
DROP INDEX IF EXISTS idx_inventory_expiration; -- Keep idx_inventory_expiry

-- Support Tickets
DROP INDEX IF EXISTS idx_tickets_created_desc; -- Keep idx_tickets_created
DROP INDEX IF EXISTS idx_tickets_resolved_by; -- Keep idx_support_tickets_resolved_by (checking if exists first)

-- Ticket Messages
DROP INDEX IF EXISTS idx_ticket_msgs_ticket; -- Keep idx_ticket_messages_ticket_id
DROP INDEX IF EXISTS idx_ticket_msgs_user; -- Keep idx_ticket_messages_user_id
DROP INDEX IF EXISTS idx_ticket_msgs_created; -- Keep idx_ticket_messages_created_at (if exists) usually created_at is default

-- 2. OPTIMIZE RLS POLICIES (Wrap auth.uid() in SELECT)
-- Profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING ((select auth.uid()) = id);

-- Injections
DROP POLICY IF EXISTS "Users can view own injections" ON injections;
CREATE POLICY "Users can view own injections" ON injections FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own injections" ON injections;
CREATE POLICY "Users can insert own injections" ON injections FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own injections" ON injections;
CREATE POLICY "Users can update own injections" ON injections FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own injections" ON injections;
CREATE POLICY "Users can delete own injections" ON injections FOR DELETE USING ((select auth.uid()) = user_id);

-- Inventory
DROP POLICY IF EXISTS "Users can view own inventory" ON inventory;
CREATE POLICY "Users can view own inventory" ON inventory FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own inventory" ON inventory; -- Likely covers Insert/Update/Delete
CREATE POLICY "Users can manage own inventory" ON inventory FOR ALL USING ((select auth.uid()) = user_id);

-- Reviews
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
CREATE POLICY "Users can insert their own reviews" ON reviews FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE USING ((select auth.uid()) = user_id);

-- Support Tickets
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
CREATE POLICY "Users can view their own tickets" ON support_tickets FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own tickets" ON support_tickets;
CREATE POLICY "Users can create their own tickets" ON support_tickets FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Audit Logs
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
CREATE POLICY "Users can view their own audit logs" ON audit_logs FOR SELECT USING ((select auth.uid()) = user_id);

-- 3. REMOVE REDUNDANT POLICIES (Multiple Permissive Policies)
-- Audit Logs
-- Dropping older/duplicate named policies, keeping the most descriptive one
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs; -- Duplicate of "Users can view their own audit logs"

-- Reviews
DROP POLICY IF EXISTS "Users can create own reviews" ON reviews; -- Duplicate
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews; -- Duplicate
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews; -- Duplicate

-- Schedules
DROP POLICY IF EXISTS "Users can view own schedules" ON schedules;
CREATE POLICY "Users can view own schedules" ON schedules FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own schedules" ON schedules;
CREATE POLICY "Users can insert own schedules" ON schedules FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own schedules" ON schedules;
CREATE POLICY "Users can update own schedules" ON schedules FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own schedules" ON schedules;
CREATE POLICY "Users can delete own schedules" ON schedules FOR DELETE USING ((select auth.uid()) = user_id);

