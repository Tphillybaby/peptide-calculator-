import React, { useState, useEffect } from 'react';
import {
    MessageSquare, Search, Trash2, Eye, RefreshCw,
    Filter, ChevronDown, ChevronUp, AlertTriangle,
    CheckCircle, XCircle, MessageCircle, User, Calendar,
    Flag, ThumbsUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import styles from './AdminForum.module.css';

const AdminForum = () => {
    const [activeTab, setActiveTab] = useState('topics'); // topics or posts
    const [topics, setTopics] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalTopics: 0,
        totalPosts: 0,
        activeToday: 0
    });

    useEffect(() => {
        fetchCategories();
        fetchData();
    }, [activeTab]);

    const fetchCategories = async () => {
        try {
            const { data } = await supabase
                .from('forum_categories')
                .select('*')
                .order('name');
            setCategories(data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'topics') {
                await fetchTopics();
            } else {
                await fetchPosts();
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
        }
        setLoading(false);
    };

    const fetchTopics = async () => {
        const { data, error } = await supabase
            .from('forum_topics')
            .select(`
                *,
                profiles:user_id (email, full_name),
                forum_categories:category_id (name, slug)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        setTopics(data || []);

        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeToday = (data || []).filter(t => new Date(t.created_at) >= today).length;

        setStats(prev => ({
            ...prev,
            totalTopics: data?.length || 0,
            activeToday
        }));
    };

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('forum_posts')
            .select(`
                *,
                profiles:user_id (email, full_name),
                forum_topics:topic_id (title)
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        setPosts(data || []);

        setStats(prev => ({
            ...prev,
            totalPosts: data?.length || 0
        }));
    };

    const deleteTopic = async (id, title) => {
        if (!window.confirm(`Delete topic "${title}" and all its posts? This cannot be undone.`)) return;

        try {
            // Delete all posts in the topic first
            await supabase.from('forum_posts').delete().eq('topic_id', id);
            // Delete the topic
            const { error } = await supabase.from('forum_topics').delete().eq('id', id);
            if (error) throw error;

            setTopics(prev => prev.filter(t => t.id !== id));
            showSuccess(`Topic "${title}" deleted`);
        } catch (err) {
            console.error('Error deleting topic:', err);
            setError('Failed to delete topic');
        }
    };

    const deletePost = async (id) => {
        if (!window.confirm('Delete this post? This cannot be undone.')) return;

        try {
            const { error } = await supabase.from('forum_posts').delete().eq('id', id);
            if (error) throw error;

            setPosts(prev => prev.filter(p => p.id !== id));
            showSuccess('Post deleted');
        } catch (err) {
            console.error('Error deleting post:', err);
            setError('Failed to delete post');
        }
    };

    const togglePinned = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('forum_topics')
                .update({ is_pinned: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setTopics(prev => prev.map(t =>
                t.id === id ? { ...t, is_pinned: !currentStatus } : t
            ));
            showSuccess(currentStatus ? 'Topic unpinned' : 'Topic pinned');
        } catch (err) {
            console.error('Error updating topic:', err);
        }
    };

    const toggleLocked = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('forum_topics')
                .update({ is_locked: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setTopics(prev => prev.map(t =>
                t.id === id ? { ...t, is_locked: !currentStatus } : t
            ));
            showSuccess(currentStatus ? 'Topic unlocked' : 'Topic locked');
        } catch (err) {
            console.error('Error updating topic:', err);
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncate = (text, length = 100) => {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    const filteredTopics = topics.filter(topic => {
        const matchesSearch = topic.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || topic.category_id === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredPosts = posts.filter(post =>
        post.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1><MessageSquare size={28} /> Forum Moderation</h1>
                    <p>Manage forum topics and posts</p>
                </div>
                <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
                    <RefreshCw size={18} className={loading ? styles.spin : ''} />
                    Refresh
                </button>
            </div>

            {/* Messages */}
            {successMessage && (
                <div className={styles.successBanner}>
                    <CheckCircle size={18} /> {successMessage}
                </div>
            )}
            {error && (
                <div className={styles.errorBanner}>
                    <XCircle size={18} /> {error}
                </div>
            )}

            {/* Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <MessageSquare size={24} />
                    <div>
                        <span className={styles.statValue}>{stats.totalTopics}</span>
                        <span className={styles.statLabel}>Topics</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <MessageCircle size={24} />
                    <div>
                        <span className={styles.statValue}>{stats.totalPosts}</span>
                        <span className={styles.statLabel}>Posts</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <Calendar size={24} />
                    <div>
                        <span className={styles.statValue}>{stats.activeToday}</span>
                        <span className={styles.statLabel}>New Today</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'topics' ? styles.active : ''}`}
                    onClick={() => setActiveTab('topics')}
                >
                    <MessageSquare size={18} /> Topics
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'posts' ? styles.active : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    <MessageCircle size={18} /> Posts
                </button>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder={activeTab === 'topics' ? 'Search topics...' : 'Search posts...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === 'topics' && categories.length > 0 && (
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className={styles.loading}>
                    <RefreshCw size={24} className={styles.spin} />
                    Loading...
                </div>
            ) : activeTab === 'topics' ? (
                <div className={styles.list}>
                    {filteredTopics.length === 0 ? (
                        <div className={styles.emptyState}>
                            <MessageSquare size={48} />
                            <h3>No topics found</h3>
                        </div>
                    ) : (
                        filteredTopics.map(topic => (
                            <div key={topic.id} className={styles.item}>
                                <div className={styles.itemContent}>
                                    <div className={styles.itemHeader}>
                                        <h3>{topic.title}</h3>
                                        <div className={styles.badges}>
                                            {topic.is_pinned && (
                                                <span className={styles.pinnedBadge}>Pinned</span>
                                            )}
                                            {topic.is_locked && (
                                                <span className={styles.lockedBadge}>Locked</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.itemMeta}>
                                        <span><User size={14} /> {topic.profiles?.full_name || topic.profiles?.email?.split('@')[0] || 'Unknown'}</span>
                                        <span><Calendar size={14} /> {formatDate(topic.created_at)}</span>
                                        {topic.forum_categories && (
                                            <span className={styles.categoryBadge}>{topic.forum_categories.name}</span>
                                        )}
                                        <span><ThumbsUp size={14} /> {topic.likes_count || 0}</span>
                                        <span><MessageCircle size={14} /> {topic.replies_count || 0} replies</span>
                                    </div>
                                </div>
                                <div className={styles.itemActions}>
                                    <button
                                        onClick={() => togglePinned(topic.id, topic.is_pinned)}
                                        className={topic.is_pinned ? styles.unpinBtn : styles.pinBtn}
                                        title={topic.is_pinned ? 'Unpin' : 'Pin'}
                                    >
                                        {topic.is_pinned ? 'Unpin' : 'Pin'}
                                    </button>
                                    <button
                                        onClick={() => toggleLocked(topic.id, topic.is_locked)}
                                        className={topic.is_locked ? styles.unlockBtn : styles.lockBtn}
                                        title={topic.is_locked ? 'Unlock' : 'Lock'}
                                    >
                                        {topic.is_locked ? 'Unlock' : 'Lock'}
                                    </button>
                                    <button
                                        onClick={() => deleteTopic(topic.id, topic.title)}
                                        className={styles.deleteBtn}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className={styles.list}>
                    {filteredPosts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <MessageCircle size={48} />
                            <h3>No posts found</h3>
                        </div>
                    ) : (
                        filteredPosts.map(post => (
                            <div key={post.id} className={styles.item}>
                                <div className={styles.itemContent}>
                                    <div className={styles.itemHeader}>
                                        <h4>{post.forum_topics?.title || 'Unknown Topic'}</h4>
                                    </div>
                                    <p className={styles.postContent}>{truncate(post.content, 200)}</p>
                                    <div className={styles.itemMeta}>
                                        <span><User size={14} /> {post.profiles?.full_name || post.profiles?.email?.split('@')[0] || 'Unknown'}</span>
                                        <span><Calendar size={14} /> {formatDate(post.created_at)}</span>
                                        <span><ThumbsUp size={14} /> {post.likes_count || 0}</span>
                                    </div>
                                </div>
                                <div className={styles.itemActions}>
                                    <button
                                        onClick={() => deletePost(post.id)}
                                        className={styles.deleteBtn}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Results count */}
            {!loading && (
                <div className={styles.resultsCount}>
                    Showing {activeTab === 'topics' ? filteredTopics.length : filteredPosts.length} items
                </div>
            )}
        </div>
    );
};

export default AdminForum;
