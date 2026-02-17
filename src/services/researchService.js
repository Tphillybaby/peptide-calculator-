/**
 * Research Library Service
 * Manages research papers, user saved papers, and search functionality
 */
import { supabase } from '../lib/supabase';

// Category definitions
export const RESEARCH_CATEGORIES = {
    'weight-loss': { name: 'Weight Loss', icon: '⚖️', color: '#10b981' },
    'muscle-growth': { name: 'Muscle Growth', icon: '💪', color: '#8b5cf6' },
    'healing': { name: 'Healing & Recovery', icon: '🩹', color: '#f59e0b' },
    'anti-aging': { name: 'Anti-Aging', icon: '✨', color: '#ec4899' },
    'cognitive': { name: 'Cognitive', icon: '🧠', color: '#3b82f6' },
    'nootropic': { name: 'Nootropic', icon: '💡', color: '#06b6d4' },
    'growth-hormone': { name: 'Growth Hormone', icon: '📈', color: '#6366f1' },
    'sexual-health': { name: 'Sexual Health', icon: '❤️', color: '#ef4444' },
    'fat-loss': { name: 'Fat Loss', icon: '🔥', color: '#f97316' },
    'clinical-trial': { name: 'Clinical Trials', icon: '🔬', color: '#14b8a6' },
    'mechanisms': { name: 'Mechanisms', icon: '⚙️', color: '#64748b' },
    'research': { name: 'Basic Research', icon: '📖', color: '#a855f7' },
    'FDA-approved': { name: 'FDA Approved', icon: '✓', color: '#22c55e' },
    'GLP-1': { name: 'GLP-1 Agonists', icon: '💊', color: '#0ea5e9' },
    'GIP': { name: 'GIP Agonists', icon: '💊', color: '#0ea5e9' }
};

class ResearchService {
    constructor() {
        this.cache = {
            papers: null,
            lastFetch: null
        };
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    }

    // Get all research papers
    async getPapers(options = {}) {
        const { category, peptide, search, limit = 50, featured = false } = options;

        // Check cache for basic queries
        if (!category && !peptide && !search && !featured && this.cache.papers) {
            const cacheAge = Date.now() - this.cache.lastFetch;
            if (cacheAge < this.CACHE_DURATION) {
                return this.cache.papers.slice(0, limit);
            }
        }

        try {
            let query = supabase
                .from('research_papers')
                .select('*')
                .order('is_featured', { ascending: false })
                .order('publication_date', { ascending: false })
                .limit(limit);

            if (featured) {
                query = query.eq('is_featured', true);
            }

            if (category) {
                query = query.contains('categories', [category]);
            }

            if (peptide) {
                query = query.contains('peptides', [peptide]);
            }

            if (search) {
                query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%,summary.ilike.%${search}%`);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Update cache for basic queries
            if (!category && !peptide && !search && !featured) {
                this.cache.papers = data;
                this.cache.lastFetch = Date.now();
            }

            return data || [];
        } catch (err) {
            console.error('Error fetching papers:', err);
            return [];
        }
    }

    // Get featured papers
    async getFeaturedPapers(limit = 5) {
        return this.getPapers({ featured: true, limit });
    }

    // Get papers for a specific peptide
    async getPapersForPeptide(peptideName, limit = 10) {
        return this.getPapers({ peptide: peptideName, limit });
    }

    // Get paper by ID
    async getPaperById(id) {
        try {
            const { data, error } = await supabase
                .from('research_papers')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error fetching paper:', err);
            return null;
        }
    }

    // Save paper for user
    async savePaper(userId, paperId, notes = '') {
        if (!userId) throw new Error('User not authenticated');

        try {
            const { data, error } = await supabase
                .from('saved_research')
                .upsert({
                    user_id: userId,
                    paper_id: paperId,
                    notes
                }, {
                    onConflict: 'user_id,paper_id'
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error saving paper:', err);
            throw err;
        }
    }

    // Remove saved paper
    async unsavePaper(userId, paperId) {
        if (!userId) throw new Error('User not authenticated');

        try {
            const { error } = await supabase
                .from('saved_research')
                .delete()
                .eq('user_id', userId)
                .eq('paper_id', paperId);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error removing saved paper:', err);
            throw err;
        }
    }

    // Get user's saved papers
    async getSavedPapers(userId) {
        if (!userId) return [];

        try {
            const { data, error } = await supabase
                .from('saved_research')
                .select(`
          *,
          paper:research_papers(*)
        `)
                .eq('user_id', userId)
                .order('saved_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Error fetching saved papers:', err);
            return [];
        }
    }

    // Check if paper is saved
    async isPaperSaved(userId, paperId) {
        if (!userId) return false;

        try {
            const { data, error } = await supabase
                .from('saved_research')
                .select('id')
                .eq('user_id', userId)
                .eq('paper_id', paperId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return !!data;
        } catch (err) {
            console.error('Error checking saved status:', err);
            return false;
        }
    }

    // Update notes on saved paper
    async updatePaperNotes(userId, paperId, notes) {
        if (!userId) throw new Error('User not authenticated');

        try {
            const { data, error } = await supabase
                .from('saved_research')
                .update({ notes })
                .eq('user_id', userId)
                .eq('paper_id', paperId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error updating notes:', err);
            throw err;
        }
    }

    // Get all available categories
    async getCategories() {
        try {
            const { data, error } = await supabase
                .from('research_papers')
                .select('categories');

            if (error) throw error;

            // Flatten and dedupe categories
            const allCategories = new Set();
            data?.forEach(paper => {
                paper.categories?.forEach(cat => allCategories.add(cat));
            });

            return Array.from(allCategories).map(cat => ({
                id: cat,
                ...RESEARCH_CATEGORIES[cat] || { name: cat, icon: '📄', color: '#6b7280' }
            }));
        } catch (err) {
            console.error('Error fetching categories:', err);
            return Object.entries(RESEARCH_CATEGORIES).map(([id, data]) => ({ id, ...data }));
        }
    }

    // Get papers grouped by category
    async getPapersGroupedByCategory() {
        const papers = await this.getPapers({ limit: 100 });
        const grouped = {};

        papers.forEach(paper => {
            paper.categories?.forEach(cat => {
                if (!grouped[cat]) {
                    grouped[cat] = [];
                }
                grouped[cat].push(paper);
            });
        });

        return grouped;
    }

    // Search papers
    async searchPapers(query) {
        return this.getPapers({ search: query, limit: 20 });
    }

    // Get related papers
    async getRelatedPapers(paper, limit = 5) {
        if (!paper) return [];

        // Find papers with overlapping peptides or categories
        const papers = await this.getPapers({ limit: 50 });

        const scored = papers
            .filter(p => p.id !== paper.id)
            .map(p => {
                let score = 0;
                // Score by peptide overlap
                paper.peptides?.forEach(peptide => {
                    if (p.peptides?.includes(peptide)) score += 3;
                });
                // Score by category overlap
                paper.categories?.forEach(cat => {
                    if (p.categories?.includes(cat)) score += 1;
                });
                return { ...p, relevanceScore: score };
            })
            .filter(p => p.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);

        return scored.slice(0, limit);
    }

    // Clear cache
    clearCache() {
        this.cache.papers = null;
        this.cache.lastFetch = null;
    }
}

export const researchService = new ResearchService();
export default researchService;
