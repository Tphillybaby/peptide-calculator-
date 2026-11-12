export const safePriceUrl = value => {
    try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; }
};
export const quoteMassMg = row => {
    const amount = Number(row.quantity_mg);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    const unit = String(row.quantity_unit || '').toLowerCase();
    return unit === 'mg' ? amount : unit === 'mcg' ? amount / 1000 : null;
};
export const normalizeQuote = (row, now = new Date()) => {
    const price = Number(row.price);
    if (!Number.isFinite(price) || price <= 0) return null;
    const vendor = Array.isArray(row.vendors) ? row.vendors[0] : row.vendors;
    if (!vendor || vendor.is_active === false) return null;
    const massMg = quoteMassMg(row);
    const verified = new Date(row.last_verified_at);
    const age = row.last_verified_at && Number.isFinite(verified.getTime()) ? now - verified : null;
    const productUrl = safePriceUrl(row.product_url);
    return { ...row, price, vendor, massMg, perMg: massMg ? price / massMg : null,
        verified: age !== null && age >= 0 ? verified : null,
        fresh: age !== null && age >= 0 && age <= 7 * 86400000,
        url: productUrl || safePriceUrl(vendor.website_url), productLink: Boolean(productUrl) };
};
export const sortQuotes = (quotes, sort, query = '', stockOnly = false) => quotes.filter(q =>
    (!stockOnly || q.in_stock === true) && q.vendor.name.toLowerCase().includes(query.trim().toLowerCase()))
    .slice().sort((a,b) => {
        if (sort === 'perMg') return (a.perMg ?? Infinity) - (b.perMg ?? Infinity) || a.price - b.price;
        if (sort === 'newest') return (b.verified?.getTime() || 0) - (a.verified?.getTime() || 0);
        return sort === 'highest' ? b.price - a.price : a.price - b.price;
    });
export const lowestComparableQuote = quotes => quotes.filter(q => q.fresh && q.in_stock === true && q.perMg !== null).reduce((best,q) => !best || q.perMg < best.perMg ? q : best, null);
