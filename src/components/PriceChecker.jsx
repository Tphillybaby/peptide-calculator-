import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, ExternalLink, AlertCircle, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PriceAlerts from './PriceAlerts';
import { normalizeQuote, sortQuotes, lowestComparableQuote, quoteMassMg } from '../utils/priceQuotes';
import styles from './PriceChecker.module.css';
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
const priceFields = 'id,peptide_name,price,unit,quantity,quantity_mg,quantity_unit,in_stock,product_url,last_verified_at,original_product_name,vendors!inner(name,slug,website_url,is_active,shipping_info)';

function QuoteHistory({ quote }) {
    const [state, setState] = useState({ loading: true, rows: [], error: false });
    useEffect(() => {
        let active = true;
        setState({ loading: true, rows: [], error: false });
        supabase.from('price_history').select('id,price,quantity_mg,recorded_at').eq('peptide_price_id', quote.id).order('recorded_at', { ascending: false }).limit(30)
            .then(({ data, error }) => { if (active) setState({ loading: false, rows: error ? [] : (data || []).filter(r => Number(r.price) > 0 && Number.isFinite(Number(r.price)) && Number.isFinite(new Date(r.recorded_at).getTime())), error: Boolean(error) }); })
            .catch(() => { if (active) setState({ loading: false, rows: [], error: true }); });
        return () => { active = false; };
    }, [quote.id]);
    return <div className={styles.quoteHistory}><h3>Recorded history for this listing</h3><p>Up to 30 saved observations. Vial amounts can change; compare the amount beside each price.</p>
        {state.loading ? <p role="status">Loading history…</p> : state.error ? <p role="alert">History could not be loaded. Close and reopen it to try again.</p> : !state.rows.length ? <p>No price history recorded for this listing.</p> : <div className={styles.historyScroll}><table><thead><tr><th>Recorded</th><th>Item price</th><th>Amount</th><th>Price / mg</th></tr></thead><tbody>{state.rows.map(row => { const mass = quoteMassMg({ ...row, quantity_unit: 'mg' }); return <tr key={row.id}><td>{new Date(row.recorded_at).toLocaleString()}</td><td>{money(Number(row.price))}</td><td>{mass ? `${mass} mg` : 'Unknown'}</td><td>{mass ? money(Number(row.price) / mass) : 'Unavailable'}</td></tr>; })}</tbody></table></div>}
    </div>;
}

export default function PriceChecker() {
    const [catalog, setCatalog] = useState([]);
    const [selected, setSelected] = useState('');
    const [catalogState, setCatalogState] = useState('loading');
    const [catalogRevision, setCatalogRevision] = useState(0);
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('perMg');
    const [stockOnly, setStockOnly] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [showAlerts, setShowAlerts] = useState(false);
    useEffect(() => {
        let active = true;
        setCatalogState('loading');
        supabase.rpc('get_available_peptides').then(({ data, error }) => {
            if (!active) return;
            if (error) { setCatalogState('error'); return; }
            const rows = [...new Map((data || []).filter(r => r.peptide_slug && r.peptide_name).map(r => [r.peptide_slug, r])).values()].sort((a,b) => a.peptide_name.localeCompare(b.peptide_name));
            setCatalog(rows); setCatalogState('ready'); setSelected(prev => rows.some(r => r.peptide_slug === prev) ? prev : rows[0]?.peptide_slug || '');
        }).catch(() => { if (active) setCatalogState('error'); });
        return () => { active = false; };
    }, [catalogRevision]);
    useEffect(() => {
        let active = true;
        setQuotes([]); setExpanded(null); setError('');
        if (!selected) return;
        setLoading(true);
        supabase.from('peptide_prices').select(priceFields).eq('peptide_slug', selected).eq('vendors.is_active', true)
            .then(({ data, error }) => {
                if (!active) return;
                if (error) { setError('Recorded prices could not be loaded. Try reloading them.'); return; }
                setQuotes((data || []).map(r => normalizeQuote(r)).filter(Boolean));
            }).catch(() => { if (active) setError('Recorded prices could not be loaded. Try reloading them.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [selected, revision]);
    const visible = useMemo(() => sortQuotes(quotes, sort, query, stockOnly), [quotes, sort, query, stockOnly]);
    const lowest = lowestComparableQuote(visible);
    const newest = quotes.reduce((date,q) => q.verified && (!date || q.verified > date) ? q.verified : date, null);
    const name = catalog.find(r => r.peptide_slug === selected)?.peptide_name || '';
    return <div className={styles.container}>
        <header className={styles.header}><h1 className={styles.title}>Peptide Price Checker</h1><p className={styles.subtitle}>Compare recorded vendor quotes and vial amounts.</p></header>
        <div className={styles.quoteNotice}><AlertCircle size={22} aria-hidden="true" /><div><strong>Recorded quotes, not live checkout prices</strong><p>Prices are in USD and exclude shipping, tax, and unverified discounts. A listing is not an endorsement or a guarantee of product quality, availability, or suitability.</p></div></div>
        {catalogState === 'loading' ? <p role="status">Loading substances…</p> : catalogState === 'error' ? <div role="alert" className={styles.emptyState}><p>The price catalog could not be loaded. No estimated prices are substituted.</p><button type="button" onClick={() => setCatalogRevision(r => r + 1)}>Retry catalog</button></div> : !catalog.length ? <p>No vendor quotes have been recorded yet.</p> : <>
        <div className={styles.controls}>
            <div className={styles.selectWrapper}><label htmlFor="price-substance" className={styles.label}>Substance</label><select id="price-substance" className={styles.select} value={selected} onChange={e => setSelected(e.target.value)}>{catalog.map(item => <option key={item.peptide_slug} value={item.peptide_slug}>{item.peptide_name}</option>)}</select></div>
            <button type="button" className={styles.refreshBtn} disabled={loading} onClick={() => setRevision(r => r + 1)}><RefreshCw size={18} aria-hidden="true" /> Reload recorded prices</button>
            <button type="button" onClick={() => setShowAlerts(v => !v)} aria-expanded={showAlerts}>Manage price alerts</button>
        </div>
        <p className={styles.quoteMeta}>Reloading reads saved quotes; it does not contact vendor websites. {newest ? `Most recent recorded verification: ${newest.toLocaleString()}.` : 'No verification date available.'}</p>
        {showAlerts && <section className={styles.quotePanel}><p>Saved alerts depend on new price observations. Old quotes do not establish a current price.</p><PriceAlerts peptideName={name} /></section>}
        <div className={styles.quoteFilters}><label><Search size={16} aria-hidden="true" /> Vendor search<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label><label>Sort by<select value={sort} onChange={e => setSort(e.target.value)}><option value="perMg">Price per mg: low to high</option><option value="price">Item price: low to high</option><option value="highest">Item price: high to low</option><option value="newest">Most recently verified</option></select></label><label className={styles.quoteCheck}><input type="checkbox" checked={stockOnly} onChange={e => setStockOnly(e.target.checked)} />Recorded as in stock</label></div>
        {loading ? <p role="status">Loading recorded prices…</p> : error ? <p role="alert">{error}</p> : <>
            {quotes.length > 0 && !quotes.some(q => q.fresh) && <p role="status" className={styles.staleNotice}>No quotes for {name} were verified in the last 7 days. These older records cannot establish today’s lowest price.</p>}
            {lowest && <div className={styles.quotePanel}><strong>Lowest comparable recent quote: {money(lowest.perMg)} / mg</strong><p>{lowest.vendor.name} · {money(lowest.price)} for {lowest.massMg} mg. Based on visible quotes recorded within 7 days and recorded as in stock; checkout totals may differ.</p></div>}
            <p>{visible.length} recorded listing{visible.length === 1 ? '' : 's'} shown</p>
            {!visible.length && <div className={styles.emptyState}><h2>{quotes.length ? 'No listings match your filters' : 'No recorded prices for this substance'}</h2><p>{quotes.length ? 'Try another vendor search or turn off the stock filter.' : 'Choose another substance or try reloading later.'}</p></div>}
            <div className={styles.quoteList}>{visible.map(q => <article key={q.id} className={styles.quotePanel}><div className={styles.quoteHeading}><div><h2>{q.vendor.name}</h2><p>{q.original_product_name || name}</p></div><div><strong className={styles.quotePrice}>{money(q.price)}</strong><p>{q.massMg ? `${q.massMg} mg · ${money(q.perMg)} / mg` : `${q.quantity || 'Amount unknown'} · cost per mg unavailable`}</p></div></div>
                <p className={q.fresh ? styles.quoteMeta : styles.staleNotice}>{q.verified ? `Recorded verification: ${q.verified.toLocaleString()}${q.fresh ? '' : ' · Older than 7 days'}` : 'Verification date unknown'}</p>
                <p>Stock at last observation: {q.in_stock === true ? 'In stock' : q.in_stock === false ? 'Out of stock' : 'Unknown'}. Check the vendor for current availability.</p>
                <div className={styles.quoteActions}>{q.url ? <a href={q.url} target="_blank" rel="noopener noreferrer">{q.productLink ? 'View recorded product page' : 'Visit vendor — product link unavailable'} <ExternalLink size={16} aria-hidden="true" /></a> : <span>No valid vendor link recorded</span>}<button type="button" aria-expanded={expanded === q.id} onClick={() => setExpanded(id => id === q.id ? null : q.id)}>{expanded === q.id ? 'Hide' : 'View'} recorded history</button></div>
                {expanded === q.id && <QuoteHistory quote={q} />}
            </article>)}</div>
        </>}
        </>}
    </div>;
}
