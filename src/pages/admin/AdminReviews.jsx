import React, { useState, useEffect } from 'react';
import {
    Star, Search, Trash2, RefreshCw, Filter,
    CheckCircle, XCircle, User, Calendar, MessageSquare,
    ThumbsUp, ThumbsDown, AlertTriangle, Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import styles from './AdminReviews.module.css';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        averageRating: 0,
        fiveStar: 0,
        oneStar: 0
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    profiles:user_id (email, full_name),
                    peptides:peptide_id (name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);

            // Calculate stats
            const total = data?.length || 0;
            const avgRating = total > 0
                ? (data.reduce((sum, r) => sum + (r.rating || 0), 0) / total).toFixed(1)
                : 0;
            const fiveStar = data?.filter(r => r.rating === 5).length || 0;
            const oneStar = data?.filter(r => r.rating === 1).length || 0;

            setStats({
                total,
                averageRating: avgRating,
                fiveStar,
                oneStar
            });
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to load reviews');
        }
        setLoading(false);
    };

    const deleteReview = async (id, peptideName) => {
        if (!window.confirm(`Delete this review for "${peptideName}"? This cannot be undone.`)) return;

        try {
            const { error } = await supabase.from('reviews').delete().eq('id', id);
            if (error) throw error;

            setReviews(prev => prev.filter(r => r.id !== id));
            showSuccess('Review deleted successfully');
        } catch (err) {
            console.error('Error deleting review:', err);
            setError('Failed to delete review');
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

    const renderStars = (rating) => {
        return (
            <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={16}
                        fill={star <= rating ? '#f59e0b' : 'transparent'}
                        color={star <= rating ? '#f59e0b' : '#6b7280'}
                    />
                ))}
            </div>
        );
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch =
            review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.peptides?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRating = !filterRating || review.rating === parseInt(filterRating);

        return matchesSearch && matchesRating;
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1><Star size={28} /> Review Moderation</h1>
                    <p>Manage peptide reviews</p>
                </div>
                <button className={styles.refreshBtn} onClick={fetchReviews} disabled={loading}>
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
                    <Star size={24} style={{ color: '#f59e0b' }} />
                    <div>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Reviews</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.avgRating}>
                        <span>{stats.averageRating}</span>
                    </div>
                    <div>
                        <span className={styles.statValue}>Avg Rating</span>
                        <span className={styles.statLabel}>out of 5</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <ThumbsUp size={24} style={{ color: '#10b981' }} />
                    <div>
                        <span className={styles.statValue}>{stats.fiveStar}</span>
                        <span className={styles.statLabel}>5-Star Reviews</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <ThumbsDown size={24} style={{ color: '#ef4444' }} />
                    <div>
                        <span className={styles.statValue}>{stats.oneStar}</span>
                        <span className={styles.statLabel}>1-Star Reviews</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search reviews by content, peptide, or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className={styles.loading}>
                    <RefreshCw size={24} className={styles.spin} />
                    Loading reviews...
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className={styles.emptyState}>
                    <Star size={48} />
                    <h3>No reviews found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {filteredReviews.map(review => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.peptideInfo}>
                                    <Link
                                        to={`/encyclopedia/${encodeURIComponent(review.peptides?.name || '')}`}
                                        className={styles.peptideLink}
                                    >
                                        {review.peptides?.name || 'Unknown Peptide'}
                                    </Link>
                                    {renderStars(review.rating)}
                                </div>
                                <button
                                    onClick={() => deleteReview(review.id, review.peptides?.name)}
                                    className={styles.deleteBtn}
                                    title="Delete review"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>

                            {review.comment && (
                                <p className={styles.reviewComment}>{review.comment}</p>
                            )}

                            <div className={styles.reviewMeta}>
                                <span>
                                    <User size={14} />
                                    {review.profiles?.full_name || review.profiles?.email?.split('@')[0] || 'Anonymous'}
                                </span>
                                <span>
                                    <Calendar size={14} />
                                    {formatDate(review.created_at)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results count */}
            {!loading && filteredReviews.length > 0 && (
                <div className={styles.resultsCount}>
                    Showing {filteredReviews.length} of {reviews.length} reviews
                </div>
            )}
        </div>
    );
};

export default AdminReviews;
