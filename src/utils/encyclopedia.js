import { slugify } from './slugify.js';
export const searchPeptides = (items, query) => {
    const term = query.trim().toLowerCase();
    return items.filter(p => !term || [p.name, p.description, p.category, ...(Array.isArray(p.benefits) ? p.benefits : [])].some(value => String(value || '').toLowerCase().includes(term)));
};
export const findPeptide = (items, param) => {
    if (!param) return null;
    let decoded;
    try { decoded = decodeURIComponent(param); } catch { return null; }
    const exact = items.find(p => slugify(p.name) === decoded.toLowerCase() || p.name.toLowerCase() === decoded.toLowerCase());
    if (exact) return exact;
    const matches = items.filter(p => slugify(p.name.split(' (')[0]) === decoded.toLowerCase());
    return matches.length === 1 ? matches[0] : null;
};

export const uniquePeptides = items => {
    const seen = new Set();
    return [...items].sort((a,b) => String(a.id || a.name).localeCompare(String(b.id || b.name))).filter(item => {
        const key = slugify(item.name);
        if (!key || seen.has(key)) return false;
        seen.add(key); return true;
    });
};
