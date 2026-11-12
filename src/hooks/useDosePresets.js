import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { presetFromForm } from '../utils/dailyTools';
const guestKey = 'peptidelog_guest_dose_presets';
export const useDosePresets = () => {
    const { user, authReady } = useAuth();
    const scope = user?.id || 'guest';
    const scopeRef = useRef(scope); scopeRef.current = scope;
    const [presets, setPresets] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        let cancelled = false;
        setPresets([]); setError(''); setLoading(true);
        if (!authReady) return;
        (async () => {
            try {
                const result = user ? await supabase.from('dose_presets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) : { data: JSON.parse(localStorage.getItem(guestKey) || '[]') };
                if (result.error) throw result.error;
                if (!cancelled) setPresets(Array.isArray(result.data) ? result.data : []);
            } catch { if (!cancelled) setError('Could not load saved protocols.'); }
            finally { if (!cancelled) setLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [user?.id, authReady]);
    const save = async (name, form) => {
        if (busy || !authReady || loading) return false;
        const operationScope = scope;
        setBusy(true); setError('');
        try {
            const draft = presetFromForm(name, form);
            const result = user ? await supabase.from('dose_presets').insert({ ...draft, user_id: user.id }).select().single() : { data: { ...draft, id: crypto.randomUUID() } };
            if (result.error) throw result.error;
            if (scopeRef.current !== operationScope) return false;
            const next = [result.data, ...presets];
            if (!user) localStorage.setItem(guestKey, JSON.stringify(next));
            setPresets(next); return true;
        } catch (e) { if (scopeRef.current !== operationScope) return false; setError(e.message || 'Could not save protocol.'); return false; }
        finally { setBusy(false); }
    };
    const remove = async id => {
        if (busy) return;
        const operationScope = scope;
        setBusy(true); setError('');
        try {
            if (user) { const { error } = await supabase.from('dose_presets').delete().eq('id', id).eq('user_id', user.id); if (error) throw error; }
            if (scopeRef.current !== operationScope) return;
            const next = presets.filter(p => p.id !== id);
            if (!user) localStorage.setItem(guestKey, JSON.stringify(next));
            setPresets(next);
        } catch { if (scopeRef.current === operationScope) setError('Could not remove protocol.'); }
        finally { setBusy(false); }
    };
    return { presets, save, remove, loading, busy, error, synced: Boolean(user) };
};
