-- 1. Seed Forum Categories
INSERT INTO public.forum_categories (name, slug, description, icon, color, sort_order, is_restricted)
VALUES
('General Discussion', 'general', 'Anything and everything about peptides.', 'MessageCircle', '#6366f1', 1, false),
('Peptide Protocols', 'protocols', 'Share and discuss your research protocols.', 'Beaker', '#10b981', 2, false),
('Source Reviews', 'reviews', 'Where to find reliable research materials. (Verified Members Only)', 'Shield', '#f59e0b', 3, true),
('Results & Progress', 'results', 'Post your before/after results and data logs.', 'TrendingUp', '#8b5cf6', 4, false),
('Side Effects & Safety', 'safety', 'Help with managing side effects and safety concerns.', 'HelpCircle', '#ef4444', 5, false),
('Marketplace', 'market', 'Buy, sell, and trade equipment (No controlled substances).', 'ShoppingBag', '#ec4899', 6, true)
ON CONFLICT (slug) DO UPDATE SET
description = EXCLUDED.description,
icon = EXCLUDED.icon,
color = EXCLUDED.color;

-- 2. Seed Forum Topics (Attributed to the first user found, likely Admin)
DO $$
DECLARE
    admin_id UUID;
    cat_general UUID;
    cat_protocols UUID;
    cat_safety UUID;
    topic_bpc UUID;
    topic_sema UUID;
BEGIN
    -- Get the ID of the first user (Admin)
    SELECT id INTO admin_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

    -- Get Category IDs
    SELECT id INTO cat_general FROM public.forum_categories WHERE slug = 'general';
    SELECT id INTO cat_protocols FROM public.forum_categories WHERE slug = 'protocols';
    SELECT id INTO cat_safety FROM public.forum_categories WHERE slug = 'safety';

    -- Only insert if we have an admin user
    IF admin_id IS NOT NULL THEN
        
        -- Topic 1: BPC-157
        INSERT INTO public.forum_topics (category_id, user_id, title, content, is_pinned, view_count)
        VALUES (cat_protocols, admin_id, 'My 4-week BPC-157 Protocol for Elbow Tendonitis', 'I just finished a 4-week cycle of BPC-157 for golfer''s elbow. \n\nDosing: 250mcg twice daily via subcutaneous injection near the site.\n\nResults: Pain reduced by about 80%. Still some stiffness in the morning but I can lift again. Has anyone else stacked this with TB-500?', false, 125)
        RETURNING id INTO topic_bpc;

        -- Topic 2: Semaglutide
        INSERT INTO public.forum_topics (category_id, user_id, title, content, is_pinned, view_count)
        VALUES (cat_general, admin_id, 'Starting Semaglutide next week - Advice?', 'I am about to start my subject on 0.25mg. I have heard about the nausea. What is the best way to mitigate this? Electrolytes? Ginger?', false, 89)
        RETURNING id INTO topic_sema;

        -- Topic 3: Reconstitution Math
        INSERT INTO public.forum_topics (category_id, user_id, title, content, is_pinned, view_count)
        VALUES (cat_safety, admin_id, 'Double check my math please', 'I have a 5mg vial. I added 2ml of BAC water. I want to dose 250mcg. \n\nIs that 10 units on a standard U-100 syringe? Thanks!', false, 240);

        -- 3. Seed Posts (Replies)
        
        -- Replies to BPC Topic
        INSERT INTO public.forum_posts (topic_id, user_id, content)
        VALUES 
        (topic_bpc, admin_id, 'Yes, TB-500 is a great addition. Usually 5mg per week split into two doses works well with BPC.'),
        (topic_bpc, admin_id, 'Did you do subq or IM? I heard IM might be better for joints.');

        -- Replies to Semaglutide Topic
        INSERT INTO public.forum_posts (topic_id, user_id, content)
        VALUES 
        (topic_sema, admin_id, 'Definitely get some Zofran if you can. Otherwise, Gin Gins (ginger chews) saved my life.'),
        (topic_sema, admin_id, 'Drink tons of water. Dehydration makes the headache way worse.');

    END IF;
END $$;
