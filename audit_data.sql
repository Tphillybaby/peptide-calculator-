-- Audit script to identify data issues
-- Run this in Supabase SQL Editor

-- 1. Count all injections grouped by user_id
SELECT 
    user_id,
    COUNT(*) as injection_count,
    MIN(injection_date) as first_injection,
    MAX(injection_date) as last_injection
FROM public.injections
GROUP BY user_id
ORDER BY injection_count DESC;

-- 2. Count all inventory grouped by user_id
SELECT 
    user_id,
    COUNT(*) as inventory_count,
    SUM(remaining_mg) as total_stock_mg
FROM public.inventory
GROUP BY user_id
ORDER BY inventory_count DESC;

-- 3. Show all unique user_ids in injections
SELECT DISTINCT user_id FROM public.injections;

-- 4. Show all unique user_ids in inventory
SELECT DISTINCT user_id FROM public.inventory;

-- 5. Match user_ids to email addresses (if you want to know who owns what)
SELECT 
    i.user_id,
    u.email,
    COUNT(*) as injection_count
FROM public.injections i
LEFT JOIN auth.users u ON i.user_id = u.id
GROUP BY i.user_id, u.email
ORDER BY injection_count DESC;
