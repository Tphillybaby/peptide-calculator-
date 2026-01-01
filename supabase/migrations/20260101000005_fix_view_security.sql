-- Migration: 20260101000005_fix_view_security.sql
-- Description: Sets security_invoker=true on views to enforce RLS and fix linter errors.
-- This ensures that when querying these views, the RLS policies of the underlying tables (profiles, reviews, etc.) are respected.

ALTER VIEW public.forum_topics_with_profiles SET (security_invoker = true);
ALTER VIEW public.forum_posts_with_profiles SET (security_invoker = true);
ALTER VIEW public.reviews_with_profiles SET (security_invoker = true);
