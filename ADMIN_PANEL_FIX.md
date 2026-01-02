# Admin Panel Fix - Instructions

## Problem
The admin panel is not loading users, reviews, and other data. Stats show 0 for all values.

## Root Cause
The `profiles` table was missing a RLS (Row Level Security) SELECT policy that allows users to view profile data. The only SELECT policy was for admins only (`Admins can view all profiles`), but this created issues because:

1. Regular users couldn't view their own profile 
2. Joined queries (like reviews with user info) failed to load profile data
3. The `is_admin()` function worked fine (it's SECURITY DEFINER), but the data queries failed

## Solution
Run the SQL fix script in Supabase Dashboard to add the missing policies.

## Steps to Fix

### Step 1: Open Supabase Dashboard
Go to your Supabase project dashboard at: https://supabase.com/dashboard

### Step 2: Navigate to SQL Editor
Click on **SQL Editor** in the left sidebar.

### Step 3: Run the Fix Script
Copy and paste the contents of `supabase/FIX_ADMIN_PANEL_NOW.sql` into the SQL Editor and click **Run**.

This script will:
- Add `"Users can view own profile"` policy
- Add `"Public profiles are viewable by everyone"` policy  
- Add `"Anyone can view reviews"` policy
- Add `"Anyone can view peptides"` policy
- Recreate the `is_admin()` function with proper settings
- Add admin policies for injections, schedules, inventory, and reviews

### Step 4: Set Yourself as Admin (if not already)
Run this SQL, replacing with your actual email:
```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

### Step 5: Verify the Fix
1. Refresh the admin panel page
2. Check the browser console (F12 → Console) for any errors
3. Verify that user counts, reviews, etc. are now loading

## Files Changed
- `supabase/migrations/20260101000009_fix_admin_panel_access.sql` - New migration with fixes
- `supabase/FIX_ADMIN_PANEL_NOW.sql` - Manual SQL script to run in dashboard
- `supabase/fix_admin_access_debug.sql` - Updated troubleshooting guide
- `src/pages/admin/AdminUsers.jsx` - Better error messages
- `src/pages/admin/AdminReviews.jsx` - Better error messages
- `src/pages/admin/AdminDashboard.jsx` - Better error logging

## Technical Details

### RLS Policies Added

| Table | Policy | Type | Condition |
|-------|--------|------|-----------|
| profiles | Users can view own profile | SELECT | auth.uid() = id |
| profiles | Public profiles are viewable by everyone | SELECT | true |
| reviews | Anyone can view reviews | SELECT | true |
| peptides | Anyone can view peptides | SELECT | true |

### is_admin() Function
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;
```

Key attributes:
- `SECURITY DEFINER` - Bypasses RLS when checking admin status
- `STABLE` - Result is consistent within a query (performance optimization)
- `SET search_path = public` - Security best practice to prevent search path attacks

## If Issues Persist

1. **Check browser console** for specific error messages
2. **Verify RLS is enabled** on the profiles table:
   ```sql
   SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'profiles';
   ```
3. **List all policies** on profiles:
   ```sql
   SELECT policyname, cmd, qual::text FROM pg_policies WHERE tablename = 'profiles';
   ```
4. **Test is_admin function**:
   ```sql
   SELECT public.is_admin() as am_i_admin;
   ```
