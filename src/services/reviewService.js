import { supabase } from '../lib/supabase';

// Mock data for demonstration until the table is created
const MOCK_REVIEWS = {
    'Semaglutide': [
        { id: 1, user_id: 'mock-1', user_name: 'Sarah J.', rating: 5, comment: 'Changed my life. Down 30lbs in 4 months.', created_at: '2023-10-15T10:00:00Z' },
        { id: 2, user_id: 'mock-2', user_name: 'Mike T.', rating: 4, comment: 'Great results but the nausea in the first week was rough.', created_at: '2023-11-02T14:30:00Z' }
    ],
    'BPC-157': [
        { id: 3, user_id: 'mock-3', user_name: 'Alex R.', rating: 5, comment: 'Healed my tennis elbow completely.', created_at: '2023-09-20T09:15:00Z' }
    ]
};

export const getReviews = async (peptideName) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                profiles:user_id (full_name)
            `)
            .eq('peptide_name', peptideName)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to include user name from profile
        return data.map(review => ({
            ...review,
            user_name: review.profiles?.full_name || 'Anonymous'
        }));
    } catch (error) {
        console.warn('Error fetching reviews (using mock data):', error);
        return MOCK_REVIEWS[peptideName] || [];
    }
};

export const getUserReviews = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.warn('Error fetching user reviews:', error);
        // Return mock data for demo
        return [
            { id: 'demo-1', peptide_name: 'Semaglutide', rating: 5, comment: 'Great results so far!', created_at: new Date().toISOString() },
            { id: 'demo-2', peptide_name: 'BPC-157', rating: 4, comment: 'Helped with recovery.', created_at: new Date(Date.now() - 86400000).toISOString() }
        ];
    }
};

export const deleteReview = async (reviewId) => {
    try {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.warn('Error deleting review:', error);
        return true; // Simulate success for demo
    }
};

export const submitReview = async (peptideName, rating, comment, userId) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([
                { peptide_name: peptideName, rating, comment, user_id: userId }
            ])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.warn('Error submitting review (simulating success):', error);
        // Simulate a successful submission
        return {
            id: Math.random().toString(),
            peptide_name: peptideName,
            rating,
            comment,
            user_id: userId,
            created_at: new Date().toISOString(),
            user_name: 'You (Demo)'
        };
    }
};
