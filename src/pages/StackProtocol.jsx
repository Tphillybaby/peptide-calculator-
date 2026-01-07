import React, { useState, useEffect } from 'react';
import StackBuilder from '../components/StackBuilder';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const StackProtocol = () => {
    const { user } = useAuth();
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkPremium = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Check if user has premium subscription
                const { data, error } = await supabase
                    .from('user_subscriptions')
                    .select('plan, status, current_period_end')
                    .eq('user_id', user.id)
                    .single();

                if (data && data.status === 'active' && ['premium', 'pro'].includes(data.plan)) {
                    const isValid = !data.current_period_end || new Date(data.current_period_end) > new Date();
                    setIsPremium(isValid);
                }
            } catch (err) {
                // No subscription found - that's okay, they're on free tier
                console.log('No subscription found');
            } finally {
                setLoading(false);
            }
        };

        checkPremium();
    }, [user]);

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div className="padding-container" style={{ padding: '20px 20px 80px' }}>
            <SEO
                title="Peptide Stack Builder | Interaction Checker"
                description="Design your custom peptide stack and check for potential interactions, synergies, and conflicts."
                keywords="peptide stack, interaction checker, stack builder, safety"
            />
            <StackBuilder isPremium={isPremium} />
        </div>
    );
};

export default StackProtocol;
