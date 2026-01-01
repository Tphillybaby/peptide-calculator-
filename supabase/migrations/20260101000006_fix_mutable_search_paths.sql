-- Migration: 20260101000006_fix_mutable_search_paths.sql
-- Description: Fixes function_search_path_mutable warnings by explicitly setting search_path to 'public'.

ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.log_action(TEXT, TEXT, TEXT, JSONB, JSONB, JSONB) SET search_path = public;
ALTER FUNCTION public.log_profile_changes() SET search_path = public;
ALTER FUNCTION public.log_injection_changes() SET search_path = public;
