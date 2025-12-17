import { supabase } from './supabase';

export const forumService = {
    // Categories
    async getCategories() {
        const { data, error } = await supabase
            .from('forum_categories')
            .select('*')
            .order('sort_order');

        if (error) throw error;
        return data;
    },

    async getCategoryWithTopics(slug, page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        // Get category
        const { data: category, error: catError } = await supabase
            .from('forum_categories')
            .select('*')
            .eq('slug', slug)
            .single();

        if (catError) throw catError;

        // Get topics with author info and reply count
        const { data: topics, error: topicsError, count } = await supabase
            .from('forum_topics')
            .select(`
        *,
        author:profiles!forum_topics_user_id_fkey(full_name),
        posts:forum_posts(count)
      `, { count: 'exact' })
            .eq('category_id', category.id)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (topicsError) throw topicsError;

        return { category, topics, totalCount: count };
    },

    // Topics
    async getTopic(topicId) {
        // Increment view count
        await supabase.rpc('increment_topic_views', { topic_id: topicId });

        const { data, error } = await supabase
            .from('forum_topics')
            .select(`
        *,
        author:profiles!forum_topics_user_id_fkey(id, full_name),
        category:forum_categories(name, slug)
      `)
            .eq('id', topicId)
            .single();

        if (error) throw error;
        return data;
    },

    async getTopicPosts(topicId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const { data, error, count } = await supabase
            .from('forum_posts')
            .select(`
        *,
        author:profiles!forum_posts_user_id_fkey(id, full_name)
      `, { count: 'exact' })
            .eq('topic_id', topicId)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { posts: data, totalCount: count };
    },

    async createTopic(categoryId, title, content) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('forum_topics')
            .insert({
                category_id: categoryId,
                user_id: user.id,
                title,
                content
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTopic(topicId, title, content) {
        const { data, error } = await supabase
            .from('forum_topics')
            .update({ title, content, updated_at: new Date().toISOString() })
            .eq('id', topicId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTopic(topicId) {
        const { error } = await supabase
            .from('forum_topics')
            .delete()
            .eq('id', topicId);

        if (error) throw error;
        return true;
    },

    // Posts
    async createPost(topicId, content) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('forum_posts')
            .insert({
                topic_id: topicId,
                user_id: user.id,
                content
            })
            .select(`
        *,
        author:profiles!forum_posts_user_id_fkey(id, full_name)
      `)
            .single();

        if (error) throw error;
        return data;
    },

    async updatePost(postId, content) {
        const { data, error } = await supabase
            .from('forum_posts')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('id', postId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deletePost(postId) {
        const { error } = await supabase
            .from('forum_posts')
            .delete()
            .eq('id', postId);

        if (error) throw error;
        return true;
    },

    async markAsSolution(postId, isSolution = true) {
        const { data, error } = await supabase
            .from('forum_posts')
            .update({ is_solution: isSolution })
            .eq('id', postId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Likes
    async toggleLike(topicId = null, postId = null) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Check if already liked
        let query = supabase.from('forum_likes').select('id').eq('user_id', user.id);

        if (topicId) query = query.eq('topic_id', topicId);
        if (postId) query = query.eq('post_id', postId);

        const { data: existing } = await query.single();

        if (existing) {
            // Unlike
            await supabase.from('forum_likes').delete().eq('id', existing.id);
            return false;
        } else {
            // Like
            await supabase.from('forum_likes').insert({
                user_id: user.id,
                topic_id: topicId,
                post_id: postId
            });
            return true;
        }
    },

    async getLikeCounts(topicId) {
        const { count: topicLikes } = await supabase
            .from('forum_likes')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topicId);

        return { topicLikes: topicLikes || 0 };
    },

    // Search
    async searchTopics(query, limit = 20) {
        const { data, error } = await supabase
            .from('forum_topics')
            .select(`
        *,
        author:profiles!forum_topics_user_id_fkey(full_name),
        category:forum_categories(name, slug)
      `)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    },

    // Recent activity
    async getRecentTopics(limit = 10) {
        const { data, error } = await supabase
            .from('forum_topics')
            .select(`
        *,
        author:profiles!forum_topics_user_id_fkey(full_name),
        category:forum_categories(name, slug, color)
      `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    },

    // Stats
    async getForumStats() {
        const { count: topicCount } = await supabase
            .from('forum_topics')
            .select('*', { count: 'exact', head: true });

        const { count: postCount } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact', head: true });

        return {
            topics: topicCount || 0,
            posts: postCount || 0
        };
    }
};

export default forumService;
