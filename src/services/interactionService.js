/**
 * Compound Interaction Service
 * Checks for interactions between peptides and provides safety information
 */
import { supabase } from '../lib/supabase';

// Fallback interaction data (used if database is empty or unavailable)
const FALLBACK_INTERACTIONS = [
    {
        compound_a: 'Semaglutide',
        compound_b: 'Tirzepatide',
        interaction_type: 'avoid',
        severity: 'high',
        description: 'Do not combine GLP-1 agonists. Both target the same receptor pathway.',
        recommendations: ['Use one or the other, never both', 'Allow 2+ weeks washout when switching']
    },
    {
        compound_a: 'BPC-157',
        compound_b: 'TB-500',
        interaction_type: 'synergy',
        severity: 'low',
        description: 'Often stacked for enhanced healing. Complementary mechanisms.',
        recommendations: ['Common healing stack', 'Popular ratio is 1:1']
    },
    {
        compound_a: 'Ipamorelin',
        compound_b: 'CJC-1295',
        interaction_type: 'synergy',
        severity: 'low',
        description: 'Classic GH secretagogue stack for amplified GH release.',
        recommendations: ['Inject together', 'Best before bed on empty stomach']
    }
];

// Interaction type metadata
export const INTERACTION_TYPES = {
    synergy: {
        label: 'Synergy',
        color: '#10b981',
        bgColor: '#10b98120',
        icon: '✓',
        description: 'These compounds work well together and may enhance effects'
    },
    neutral: {
        label: 'Neutral',
        color: '#6b7280',
        bgColor: '#6b728020',
        icon: '•',
        description: 'No significant interaction known'
    },
    caution: {
        label: 'Caution',
        color: '#f59e0b',
        bgColor: '#f59e0b20',
        icon: '!',
        description: 'Use with care - monitor for adverse effects'
    },
    avoid: {
        label: 'Avoid',
        color: '#ef4444',
        bgColor: '#ef444420',
        icon: '✕',
        description: 'Do not combine - significant risk of adverse effects'
    }
};

// Severity levels
export const SEVERITY_LEVELS = {
    low: { label: 'Low', color: '#10b981' },
    medium: { label: 'Medium', color: '#f59e0b' },
    high: { label: 'High', color: '#ef4444' }
};

class InteractionService {
    constructor() {
        this.cache = new Map();
        this.allInteractions = null;
    }

    // Normalize compound name for matching
    normalizeName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/nodac|withdac|dac/g, '');
    }

    // Load all interactions from database
    async loadInteractions() {
        if (this.allInteractions) return this.allInteractions;

        try {
            const { data, error } = await supabase
                .from('compound_interactions')
                .select('*');

            if (error) throw error;

            this.allInteractions = data && data.length > 0 ? data : FALLBACK_INTERACTIONS;
            return this.allInteractions;
        } catch (err) {
            console.error('Error loading interactions:', err);
            this.allInteractions = FALLBACK_INTERACTIONS;
            return this.allInteractions;
        }
    }

    // Check interaction between two compounds
    async checkInteraction(compoundA, compoundB) {
        const interactions = await this.loadInteractions();
        const normA = this.normalizeName(compoundA);
        const normB = this.normalizeName(compoundB);

        // Check cache
        const cacheKey = [normA, normB].sort().join('_');
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Search for matching interaction
        const interaction = interactions.find(i => {
            const iA = this.normalizeName(i.compound_a);
            const iB = this.normalizeName(i.compound_b);
            return (
                (normA.includes(iA) || iA.includes(normA)) &&
                (normB.includes(iB) || iB.includes(normB))
            ) || (
                    (normA.includes(iB) || iB.includes(normA)) &&
                    (normB.includes(iA) || iA.includes(normB))
                );
        });

        // Cache result
        this.cache.set(cacheKey, interaction || null);
        return interaction || null;
    }

    // Check interactions for a list of compounds (e.g., a stack)
    async checkStackInteractions(compounds) {
        if (!compounds || compounds.length < 2) return [];

        const results = [];
        const interactions = await this.loadInteractions();

        // Check each pair
        for (let i = 0; i < compounds.length; i++) {
            for (let j = i + 1; j < compounds.length; j++) {
                const interaction = await this.checkInteraction(compounds[i], compounds[j]);
                if (interaction) {
                    results.push({
                        ...interaction,
                        pair: [compounds[i], compounds[j]]
                    });
                }
            }
        }

        // Sort by severity (avoid first, then caution, then neutral, then synergy)
        const orderMap = { avoid: 0, caution: 1, neutral: 2, synergy: 3 };
        results.sort((a, b) => orderMap[a.interaction_type] - orderMap[b.interaction_type]);

        return results;
    }

    // Get all interactions for a specific compound
    async getInteractionsForCompound(compound) {
        const interactions = await this.loadInteractions();
        const normalized = this.normalizeName(compound);

        return interactions.filter(i => {
            const iA = this.normalizeName(i.compound_a);
            const iB = this.normalizeName(i.compound_b);
            return normalized.includes(iA) || iA.includes(normalized) ||
                normalized.includes(iB) || iB.includes(normalized);
        });
    }

    // Get interaction summary for a stack (for quick display)
    async getStackSummary(compounds) {
        const interactions = await this.checkStackInteractions(compounds);

        const summary = {
            total: interactions.length,
            avoid: interactions.filter(i => i.interaction_type === 'avoid').length,
            caution: interactions.filter(i => i.interaction_type === 'caution').length,
            synergy: interactions.filter(i => i.interaction_type === 'synergy').length,
            neutral: interactions.filter(i => i.interaction_type === 'neutral').length,
            hasWarnings: false,
            worstSeverity: null
        };

        summary.hasWarnings = summary.avoid > 0 || summary.caution > 0;

        if (summary.avoid > 0) {
            summary.worstSeverity = 'avoid';
        } else if (summary.caution > 0) {
            summary.worstSeverity = 'caution';
        }

        return { summary, interactions };
    }

    // Get all unique compounds from interactions
    async getAllCompoundsWithInteractions() {
        const interactions = await this.loadInteractions();
        const compounds = new Set();

        interactions.forEach(i => {
            compounds.add(i.compound_a);
            compounds.add(i.compound_b);
        });

        return Array.from(compounds).sort();
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        this.allInteractions = null;
    }
}

export const interactionService = new InteractionService();
export default interactionService;
