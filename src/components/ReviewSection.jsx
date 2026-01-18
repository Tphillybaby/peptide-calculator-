import React, { useState, useEffect } from 'react';
import { Star, User, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getReviews, submitReview } from '../services/reviewService';
import { paymentService } from '../services/paymentService';
import UpgradeModal from './UpgradeModal';

const ReviewSection = ({ peptideName }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        const loadReviews = async () => {
            setLoading(true);
            const data = await getReviews(peptideName);
            setReviews(data);
            setLoading(false);
        };
        loadReviews();
    }, [peptideName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        const canWrite = await paymentService.canAccessFeature(user.id, 'write_reviews');
        if (!canWrite) {
            setShowUpgradeModal(true);
            return;
        }

        if (newRating === 0) return alert('Please select a rating');

        setSubmitting(true);
        const newReview = await submitReview(peptideName, newRating, newComment, user.id);

        // Optimistically update UI
        setReviews([newReview, ...reviews]);
        setNewRating(0);
        setNewComment('');
        setSubmitting(false);
    };

    const averageRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="card glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MessageSquare size={24} color="var(--accent-primary)" />
                        Community Reviews
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        See what others are saying about {peptideName}
                    </p>
                </div>

                {reviews.length > 0 && (
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                            {averageRating}
                        </div>
                        <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end', margin: '0.25rem 0' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={16}
                                    fill={star <= Math.round(averageRating) ? '#fbbf24' : 'none'}
                                    color={star <= Math.round(averageRating) ? '#fbbf24' : '#4b5563'}
                                />
                            ))}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Form */}
            {user ? (
                <form onSubmit={handleSubmit} style={{
                    background: 'rgba(15, 23, 42, 0.3)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid var(--glass-border)'
                }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Leave a Review</h3>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'transform 0.1s'
                                }}
                            >
                                <Star
                                    size={24}
                                    fill={(hoverRating || newRating) >= star ? '#fbbf24' : 'none'}
                                    color={(hoverRating || newRating) >= star ? '#fbbf24' : '#4b5563'}
                                />
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your experience..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '1rem',
                            background: 'rgba(15, 23, 42, 0.5)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            marginBottom: '1rem',
                            resize: 'vertical'
                        }}
                    />

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={submitting || newRating === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {submitting ? 'Posting...' : 'Post Review'} <Send size={16} />
                    </button>
                </form>
            ) : (
                <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                    <p>Please <a href="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>log in</a> to leave a review.</p>
                </div>
            )}

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {loading ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>No reviews yet. Be the first to share your experience!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} style={{
                            paddingBottom: '1.5rem',
                            borderBottom: '1px solid var(--glass-border)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'var(--glass-surface)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        <User size={16} color="var(--text-secondary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{review.user_name || 'Anonymous'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={14}
                                            fill={star <= review.rating ? '#fbbf24' : 'none'}
                                            color={star <= review.rating ? '#fbbf24' : '#4b5563'}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                {review.comment}
                            </p>
                        </div>
                    ))
                )}
            </div>
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </div>
    );
};

export default ReviewSection;
