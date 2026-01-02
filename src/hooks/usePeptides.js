import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';

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

    const getPeptidesByCategory = (category) => {
        return peptides.filter(p => p.category === category);
    };

    return {
        peptides,
        loading,
        error,
        getPeptideByName,
        getPeptidesByCategory
    };
};
