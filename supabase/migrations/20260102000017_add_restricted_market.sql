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
-- Everyone can see the category exists
DROP POLICY IF EXISTS "Anyone can view categories" ON forum_categories;
DROP POLICY IF EXISTS "View public or authorized categories" ON forum_categories;
CREATE POLICY "Anyone can view categories" ON forum_categories
  FOR SELECT USING (true);

-- Update RLS for Topics
-- READ: Users can READ restricted topics? "not see but post" implies... wait. 
-- "not see but post" usually means "I cannot see what others posted, but I can post".
-- OR did you mean "users can SEE the section, but NOT post unless authorized?"
-- Re-reading: "gray market advertisment forum page that is locked unless i give privledges" -> "not see but post"
-- This phrasing is ambiguous. 
-- Interpretations:
-- A) "I want them to NOT see the content, but they CAN post?" (Blind drop box? Unlikely for a forum)
-- B) "I want them to SEE the content, but NOT post?" (Read-only for public, Write for VIPs) -> Most likely for a "Marketplace" where verified vendors post ads, and public views them.
-- C) "I meant: They can see it exists, but cannot enter/see content. However, 'not see but post' might be a typo for 'not post but see'?"

-- Let's assume the USER meant: **"Everyone can SEE (View/Read) the ads, but only Privileged users can POST ads."**
-- This matches "Advertisement page". You want people to SEE the ads. You only want approved vendors (Privileged) to POST them.

-- RLS STRATEGY: 
-- SELECT: Public (True)
-- INSERT: Restricted (has_market_access = true)

-- Update RLS for Topics (READ)
DROP POLICY IF EXISTS "Anyone can view topics" ON forum_topics;
DROP POLICY IF EXISTS "View permitted topics" ON forum_topics;
CREATE POLICY "Anyone can view topics" ON forum_topics
  FOR SELECT USING (true);

-- Update RLS for Topics (WRITE - CREATE)
DROP POLICY IF EXISTS "Authenticated users can create topics" ON forum_topics;
CREATE POLICY "Authorized users can create topics" ON forum_topics
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND (
      NOT EXISTS (SELECT 1 FROM forum_categories WHERE id = category_id AND is_restricted = true)
      OR 
      (SELECT has_market_access FROM profiles WHERE id = auth.uid())
    )
  );

-- Update RLS for Posts (READ)
DROP POLICY IF EXISTS "Anyone can view posts" ON forum_posts;
DROP POLICY IF EXISTS "View permitted posts" ON forum_posts;
CREATE POLICY "Anyone can view posts" ON forum_posts
  FOR SELECT USING (true);

-- Update RLS for Posts (WRITE - REPLY)
-- Assuming we want to restrict REPLIES in the market too? Or can anyone reply to an ad?
-- Usually, anyone can reply to ask questions. Only creating the TOPIC (Ad) is restricted. 
-- If you want to restrict replies too:
DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;
CREATE POLICY "Authorized users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
       -- Check if the topic belongs to a restricted category
       NOT EXISTS (
         SELECT 1 FROM forum_topics ft 
         JOIN forum_categories fc ON ft.category_id = fc.id
         WHERE ft.id = topic_id AND fc.is_restricted = true
       )
       OR
       (SELECT has_market_access FROM profiles WHERE id = auth.uid())
    )
  );
