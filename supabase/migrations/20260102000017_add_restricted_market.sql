-- Add permissions column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_market_access BOOLEAN DEFAULT FALSE;

-- Add restriction flag to forum categories
ALTER TABLE public.forum_categories 
ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN DEFAULT FALSE;

-- Insert the new Restricted Category
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order, is_restricted) VALUES
  ('Gray Market Ads', 'market-ads', 'Exclusive marketplace for approved vendors and members. Advertisements and deals.', 'DollarSign', '#10b981', 99, TRUE)
ON CONFLICT (slug) DO UPDATE SET is_restricted = TRUE;

-- Update RLS for Categories
-- We allow everyone to SEE the category exists, so they can see the "Locked" state
DROP POLICY IF EXISTS "Anyone can view categories" ON forum_categories;
DROP POLICY IF EXISTS "View public or authorized categories" ON forum_categories;
CREATE POLICY "Anyone can view categories" ON forum_categories
  FOR SELECT USING (true);

-- Update RLS for Topics
-- RESTRICT topics to authorized users only
DROP POLICY IF EXISTS "Anyone can view topics" ON forum_topics;
DROP POLICY IF EXISTS "View permitted topics" ON forum_topics;
CREATE POLICY "View permitted topics" ON forum_topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forum_categories fc 
      WHERE fc.id = forum_topics.category_id 
      AND (
        fc.is_restricted = FALSE 
        OR 
        (auth.uid() IS NOT NULL AND (SELECT has_market_access FROM profiles WHERE id = auth.uid()))
      )
    )
  );

-- Update RLS for Posts
DROP POLICY IF EXISTS "Anyone can view posts" ON forum_posts;
DROP POLICY IF EXISTS "View permitted posts" ON forum_posts;
CREATE POLICY "View permitted posts" ON forum_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forum_topics ft
      JOIN forum_categories fc ON ft.category_id = fc.id
      WHERE ft.id = forum_posts.topic_id
      AND (
        fc.is_restricted = FALSE 
        OR 
        (auth.uid() IS NOT NULL AND (SELECT has_market_access FROM profiles WHERE id = auth.uid()))
      )
    )
  );
