import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { slugify } from '../utils/slugify';

export const usePeptides = () => {
    const [peptides, setPeptides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPeptides = async () => {
            try {
                const { data, error } = await supabase
                    .from('peptides')
                    .select('*')
                    .order('name');

                if (error) throw error;

                // Transform snake_case DB fields to camelCase for frontend compatibility
                const transformed = (data || []).map(p => ({
                    ...p,
                    halfLife: p.half_life_hours ? `${p.half_life_hours} hours` : 'Unknown',
                    sideEffects: p.side_effects || [],
                    commonDosage: p.common_dosage || 'Consult protocol',
                    researchLinks: p.research_links || [],
                    protocols: p.dosage_protocols || [],
                    // Pre-compute the slug for fast lookups
                    slug: slugify(p.name),
                    // Keep original fields accessible too if needed
                }));

                setPeptides(transformed);
            } catch (err) {
                console.error('Error fetching peptides:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPeptides();
    }, []);

    const getPeptideByName = (name) => {
        if (!name) return null;
        return peptides.find(p => p.name.toLowerCase() === name.toLowerCase());
    };

    /**
     * Look up a peptide by its URL slug OR by its original encoded name.
     * This provides backward compatibility: old links with encoded names
     * still work, and new clean slug URLs work too.
     */
    const getPeptideBySlug = (param) => {
        if (!param) return null;

        // 1. Try exact slug match first (new clean URLs)
        const bySlug = peptides.find(p => p.slug === param.toLowerCase());
        if (bySlug) return bySlug;

        // 2. Fallback: try decoding as a name (old encoded URLs like "BPC-157" or "NAD%2B...")
        try {
            const decoded = decodeURIComponent(param);
            return peptides.find(p => p.name.toLowerCase() === decoded.toLowerCase());
        } catch {
            return null;
        }
    };

    const getPeptidesByCategory = (category) => {
        return peptides.filter(p => p.category === category);
    };

    return {
        peptides,
        loading,
        error,
        getPeptideByName,
        getPeptideBySlug,
        getPeptidesByCategory
    };
};
