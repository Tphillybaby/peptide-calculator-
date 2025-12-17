import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MessageCircle, Users, TrendingUp, Search, Plus, Eye, MessageSquare,
    Heart, Clock, Pin, ChevronRight, Loader2, X, Send, Check,
    Beaker, Shield, ShoppingBag, BookOpen, HelpCircle, Coffee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import forumService from '../lib/forumService';
import styles from './Forum.module.css';

// Icon map for categories
const iconMap = {
    MessageCircle,
    Beaker,
    TrendingUp,
    Shield,
    ShoppingBag,
    BookOpen,
    HelpCircle,
    Coffee
};

const Forum = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState('categories'); // categories, category, topic
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [posts, setPosts] = useState([]);
    const [recentTopics, setRecentTopics] = useState([]);
    const [stats, setStats] = useState({ topics: 0, posts: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showNewTopicModal, setShowNewTopicModal] = useState(false);
    const [newTopic, setNewTopic] = useState({ categoryId: '', title: '', content: '' });
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [categoriesData, recentData, statsData] = await Promise.all([
                forumService.getCategories(),
                forumService.getRecentTopics(10),
                forumService.getForumStats()
            ]);
            setCategories(categoriesData || []);
            setRecentTopics(recentData || []);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading forum data:', error);
            // Set mock data for development
            setCategories([
                { id: '1', name: 'General Discussion', slug: 'general', description: 'General peptide discussions', icon: 'MessageCircle', color: '#6366f1' },
                { id: '2', name: 'Peptide Protocols', slug: 'protocols', description: 'Dosing protocols and timing', icon: 'Beaker', color: '#10b981' },
                { id: '3', name: 'Results & Progress', slug: 'results', description: 'Share your progress and results', icon: 'TrendingUp', color: '#f59e0b' },
                { id: '4', name: 'Side Effects & Safety', slug: 'safety', description: 'Safety concerns and harm reduction', icon: 'Shield', color: '#ef4444' },
                { id: '5', name: 'Sourcing & Vendors', slug: 'sourcing', description: 'Vendor reviews and sourcing', icon: 'ShoppingBag', color: '#8b5cf6' },
                { id: '6', name: 'Research & Science', slug: 'research', description: 'Scientific studies and research', icon: 'BookOpen', color: '#06b6d4' },
                { id: '7', name: 'Beginners Corner', slug: 'beginners', description: 'New to peptides? Start here', icon: 'HelpCircle', color: '#ec4899' },
                { id: '8', name: 'Off-Topic', slug: 'off-topic', description: 'Non-peptide discussions', icon: 'Coffee', color: '#64748b' }
            ]);
            setStats({ topics: 156, posts: 1247 });
        } finally {
            setLoading(false);
        }
    };

    const loadCategory = async (slug) => {
        try {
            setLoading(true);
            const { category, topics: topicsData } = await forumService.getCategoryWithTopics(slug);
            setSelectedCategory(category);
            setTopics(topicsData || []);
            setView('category');
        } catch (error) {
            console.error('Error loading category:', error);
            // Mock data
            const cat = categories.find(c => c.slug === slug);
            setSelectedCategory(cat);
            setTopics([
                {
                    id: '1',
                    title: 'Best time to take BPC-157?',
                    content: 'What\'s the optimal timing for BPC-157 injections?',
                    author: { full_name: 'PeptideUser123' },
                    view_count: 234,
                    posts: [{ count: 12 }],
                    is_pinned: false,
                    created_at: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: '2',
                    title: 'Semaglutide dosing protocol for weight loss',
                    content: 'Looking for advice on starting semaglutide...',
                    author: { full_name: 'NewbieLifter' },
                    view_count: 567,
                    posts: [{ count: 28 }],
                    is_pinned: true,
                    created_at: new Date(Date.now() - 86400000).toISOString()
                }
            ]);
            setView('category');
        } finally {
            setLoading(false);
        }
    };

    const loadTopic = async (topicId) => {
        try {
            setLoading(true);
            const [topicData, postsData] = await Promise.all([
                forumService.getTopic(topicId),
                forumService.getTopicPosts(topicId)
            ]);
            setSelectedTopic(topicData);
            setPosts(postsData.posts || []);
            setView('topic');
        } catch (error) {
            console.error('Error loading topic:', error);
            // Mock data
            const topic = topics.find(t => t.id === topicId) || {
                id: topicId,
                title: 'Sample Topic',
                content: 'This is a sample topic content for development...',
                author: { full_name: 'TestUser', id: '123' },
                category: { name: 'General', slug: 'general' },
                view_count: 100,
                created_at: new Date().toISOString()
            };
            setSelectedTopic(topic);
            setPosts([
                {
                    id: '1',
                    content: 'Great question! I\'ve been using it for 3 months now...',
                    author: { full_name: 'ExperiencedUser', id: '456' },
                    is_solution: false,
                    created_at: new Date(Date.now() - 7200000).toISOString()
                }
            ]);
            setView('topic');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const results = await forumService.searchTopics(searchQuery);
            setSearchResults(results || []);
        } catch (error) {
            console.error('Error searching:', error);
        }
    };

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            setSubmitting(true);
            const topic = await forumService.createTopic(
                newTopic.categoryId,
                newTopic.title,
                newTopic.content
            );
            setShowNewTopicModal(false);
            setNewTopic({ categoryId: '', title: '', content: '' });
            loadTopic(topic.id);
        } catch (error) {
            console.error('Error creating topic:', error);
            alert('Failed to create topic. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!user || !replyContent.trim()) return;

        try {
            setSubmitting(true);
            const post = await forumService.createPost(selectedTopic.id, replyContent);
            setPosts([...posts, post]);
            setReplyContent('');
        } catch (error) {
            console.error('Error posting reply:', error);
            alert('Failed to post reply. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getIcon = (iconName) => {
        const Icon = iconMap[iconName] || MessageCircle;
        return Icon;
    };

    // Render categories view
    const renderCategories = () => (
        <>
            <div className={styles.header}>
                <h1>Community Forum</h1>
                <p>Connect with the peptide community, share experiences, and learn together</p>
            </div>

            <div className={styles.statsBar}>
                <div className={styles.stat}>
                    <MessageSquare size={18} />
                    <span>{stats.topics}</span> Topics
                </div>
                <div className={styles.stat}>
                    <MessageCircle size={18} />
                    <span>{stats.posts}</span> Posts
                </div>
                <div className={styles.stat}>
                    <Users size={18} />
                    <span>Active Community</span>
                </div>
            </div>

            <div className={styles.actions}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                {user ? (
                    <button className={styles.newTopicBtn} onClick={() => setShowNewTopicModal(true)}>
                        <Plus size={18} />
                        New Topic
                    </button>
                ) : (
                    <Link to="/login" className={styles.newTopicBtn}>
                        <Plus size={18} />
                        Login to Post
                    </Link>
                )}
            </div>

            <div className={styles.categoriesGrid}>
                {categories.map((category) => {
                    const Icon = getIcon(category.icon);
                    return (
                        <div
                            key={category.id}
                            className={styles.categoryCard}
                            onClick={() => loadCategory(category.slug)}
                        >
                            <div className={styles.categoryHeader}>
                                <div
                                    className={styles.categoryIcon}
                                    style={{ background: `${category.color}20`, color: category.color }}
                                >
                                    <Icon size={22} />
                                </div>
                                <span className={styles.categoryName}>{category.name}</span>
                            </div>
                            <p className={styles.categoryDesc}>{category.description}</p>
                            <div className={styles.categoryStats}>
                                <span>Topics: --</span>
                                <span>Posts: --</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {recentTopics.length > 0 && (
                <div className={styles.recentSection}>
                    <h2>Recent Discussions</h2>
                    <div className={styles.topicsList}>
                        {recentTopics.map((topic) => (
                            <div
                                key={topic.id}
                                className={styles.topicCard}
                                onClick={() => loadTopic(topic.id)}
                            >
                                <div className={styles.topicHeader}>
                                    <span className={styles.topicTitle}>
                                        {topic.is_pinned && <span className={styles.pinnedBadge}><Pin size={10} /> Pinned</span>}
                                        {topic.title}
                                    </span>
                                    {topic.category && (
                                        <span
                                            className={styles.topicCategory}
                                            style={{ background: `${topic.category.color}20`, color: topic.category.color }}
                                        >
                                            {topic.category.name}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.topicMeta}>
                                    <span>by {topic.author?.full_name || 'Anonymous'}</span>
                                    <span className={styles.topicStats}>
                                        <span className={styles.topicStat}><Eye size={14} /> {topic.view_count || 0}</span>
                                        <span className={styles.topicStat}><MessageSquare size={14} /> {topic.posts?.[0]?.count || 0}</span>
                                        <span className={styles.topicStat}><Clock size={14} /> {formatTimeAgo(topic.created_at)}</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    // Render category view
    const renderCategory = () => (
        <div className={styles.categoryPage}>
            <div className={styles.breadcrumb}>
                <a href="#" onClick={(e) => { e.preventDefault(); setView('categories'); }}>Forum</a>
                <ChevronRight size={14} />
                <span>{selectedCategory?.name}</span>
            </div>

            <div className={styles.categoryTitle}>
                {selectedCategory && (
                    <div
                        className={styles.categoryIcon}
                        style={{ background: `${selectedCategory.color}20`, color: selectedCategory.color }}
                    >
                        {React.createElement(getIcon(selectedCategory.icon), { size: 28 })}
                    </div>
                )}
                <h1>{selectedCategory?.name}</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {selectedCategory?.description}
            </p>

            <div className={styles.actions}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input type="text" placeholder="Search in this category..." />
                </div>
                {user ? (
                    <button
                        className={styles.newTopicBtn}
                        onClick={() => {
                            setNewTopic({ ...newTopic, categoryId: selectedCategory?.id });
                            setShowNewTopicModal(true);
                        }}
                    >
                        <Plus size={18} />
                        New Topic
                    </button>
                ) : (
                    <Link to="/login" className={styles.newTopicBtn}>
                        Login to Post
                    </Link>
                )}
            </div>

            {topics.length > 0 ? (
                <div className={styles.topicsList}>
                    {topics.map((topic) => (
                        <div
                            key={topic.id}
                            className={styles.topicCard}
                            onClick={() => loadTopic(topic.id)}
                        >
                            <div className={styles.topicHeader}>
                                <span className={styles.topicTitle}>
                                    {topic.is_pinned && <span className={styles.pinnedBadge}><Pin size={10} /> Pinned</span>}
                                    {topic.title}
                                </span>
                            </div>
                            <div className={styles.topicMeta}>
                                <span>by {topic.author?.full_name || 'Anonymous'}</span>
                                <span className={styles.topicStats}>
                                    <span className={styles.topicStat}><Eye size={14} /> {topic.view_count || 0}</span>
                                    <span className={styles.topicStat}><MessageSquare size={14} /> {topic.posts?.[0]?.count || 0}</span>
                                    <span className={styles.topicStat}><Clock size={14} /> {formatTimeAgo(topic.created_at)}</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <MessageCircle size={48} />
                    <h3>No topics yet</h3>
                    <p>Be the first to start a discussion in this category!</p>
                </div>
            )}
        </div>
    );

    // Render topic view
    const renderTopic = () => (
        <div className={styles.topicPage}>
            <div className={styles.breadcrumb}>
                <a href="#" onClick={(e) => { e.preventDefault(); setView('categories'); }}>Forum</a>
                <ChevronRight size={14} />
                <a href="#" onClick={(e) => { e.preventDefault(); loadCategory(selectedTopic?.category?.slug || 'general'); }}>
                    {selectedTopic?.category?.name || 'Category'}
                </a>
                <ChevronRight size={14} />
                <span>{selectedTopic?.title?.slice(0, 30)}...</span>
            </div>

            <div className={styles.topicContent}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    {selectedTopic?.title}
                </h1>

                <div className={styles.topicAuthor}>
                    <div className={styles.avatar}>
                        {getInitials(selectedTopic?.author?.full_name)}
                    </div>
                    <div className={styles.authorInfo}>
                        <span className={styles.authorName}>{selectedTopic?.author?.full_name || 'Anonymous'}</span>
                        <span className={styles.authorDate}>{formatTimeAgo(selectedTopic?.created_at)}</span>
                    </div>
                </div>

                <div className={styles.topicBody}>
                    <p>{selectedTopic?.content}</p>
                </div>

                <div className={styles.topicActions}>
                    <button className={styles.actionBtn}>
                        <Heart size={16} /> Like
                    </button>
                    <span className={styles.topicStat}><Eye size={14} /> {selectedTopic?.view_count || 0} views</span>
                </div>
            </div>

            <div className={styles.repliesSection}>
                <h3>{posts.length} Replies</h3>

                {posts.map((post) => (
                    <div key={post.id} className={`${styles.replyCard} ${post.is_solution ? styles.solution : ''}`}>
                        <div className={styles.topicAuthor}>
                            <div className={styles.avatar}>
                                {getInitials(post.author?.full_name)}
                            </div>
                            <div className={styles.authorInfo}>
                                <span className={styles.authorName}>
                                    {post.author?.full_name || 'Anonymous'}
                                    {post.is_solution && (
                                        <span className={styles.solutionBadge}><Check size={10} /> Solution</span>
                                    )}
                                </span>
                                <span className={styles.authorDate}>{formatTimeAgo(post.created_at)}</span>
                            </div>
                        </div>
                        <div className={styles.topicBody}>
                            <p>{post.content}</p>
                        </div>
                    </div>
                ))}

                {user ? (
                    <form className={styles.replyForm} onSubmit={handleReply}>
                        <h4>Write a Reply</h4>
                        <textarea
                            placeholder="Share your thoughts..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            required
                        />
                        <button type="submit" className={styles.submitReply} disabled={submitting || !replyContent.trim()}>
                            {submitting ? <Loader2 size={18} className={styles.loading} /> : <Send size={18} />}
                            Post Reply
                        </button>
                    </form>
                ) : (
                    <div className={styles.loginPrompt}>
                        <p>You need to be logged in to reply.</p>
                        <Link to="/login">Login to participate</Link>
                    </div>
                )}
            </div>
        </div>
    );

    // New topic modal
    const renderNewTopicModal = () => (
        <div className={styles.modal} onClick={() => setShowNewTopicModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Create New Topic</h2>
                    <button className={styles.closeBtn} onClick={() => setShowNewTopicModal(false)}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleCreateTopic}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label>Category</label>
                            <select
                                value={newTopic.categoryId}
                                onChange={(e) => setNewTopic({ ...newTopic, categoryId: e.target.value })}
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Title</label>
                            <input
                                type="text"
                                placeholder="What's your question or topic?"
                                value={newTopic.title}
                                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                                required
                                maxLength={200}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Content</label>
                            <textarea
                                placeholder="Provide details, context, or your thoughts..."
                                value={newTopic.content}
                                onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={() => setShowNewTopicModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={submitting}>
                            {submitting ? <Loader2 size={18} /> : <Send size={18} />}
                            Create Topic
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (loading && view === 'categories') {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <Loader2 size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {view === 'categories' && renderCategories()}
            {view === 'category' && renderCategory()}
            {view === 'topic' && renderTopic()}
            {showNewTopicModal && renderNewTopicModal()}
        </div>
    );
};

export default Forum;
