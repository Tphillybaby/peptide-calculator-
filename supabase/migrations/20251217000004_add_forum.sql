-- Forum Categories Table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'MessageCircle',
  color TEXT DEFAULT '#6366f1',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Topics Table
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Posts (Replies) Table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Likes Table
CREATE TABLE IF NOT EXISTS forum_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE NULL,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

-- Categories: Public read
CREATE POLICY "Anyone can view categories" ON forum_categories
  FOR SELECT USING (true);

-- Topics: Public read, authenticated write
CREATE POLICY "Anyone can view topics" ON forum_topics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create topics" ON forum_topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topics" ON forum_topics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own topics" ON forum_topics
  FOR DELETE USING (auth.uid() = user_id);

-- Posts: Public read, authenticated write
CREATE POLICY "Anyone can view posts" ON forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON forum_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Likes: Authenticated users only
CREATE POLICY "Users can view their likes" ON forum_likes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can like" ON forum_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON forum_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Seed default categories
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order) VALUES
  ('General Discussion', 'general', 'General peptide discussions, questions, and community chat', 'MessageCircle', '#6366f1', 1),
  ('Peptide Protocols', 'protocols', 'Discuss dosing protocols, timing, and stacking strategies', 'Beaker', '#10b981', 2),
  ('Results & Progress', 'results', 'Share your progress, results, and before/after experiences', 'TrendingUp', '#f59e0b', 3),
  ('Side Effects & Safety', 'safety', 'Discuss side effects, safety concerns, and harm reduction', 'Shield', '#ef4444', 4),
  ('Sourcing & Vendors', 'sourcing', 'Vendor reviews, third-party testing, and sourcing questions', 'ShoppingBag', '#8b5cf6', 5),
  ('Research & Science', 'research', 'Scientific studies, research papers, and mechanism discussions', 'BookOpen', '#06b6d4', 6),
  ('Beginners Corner', 'beginners', 'New to peptides? Ask your beginner questions here', 'HelpCircle', '#ec4899', 7),
  ('Off-Topic', 'off-topic', 'Non-peptide related discussions and community bonding', 'Coffee', '#64748b', 8)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_user ON forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created ON forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_topic ON forum_likes(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_post ON forum_likes(post_id);
