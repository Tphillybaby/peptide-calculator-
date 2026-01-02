// Setup type definitions for built-in Supabase environment variables
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

/**
 * Supabase Edge Function: scrape-prices
 * 
 * Scrapes peptide prices from vendor websites and updates the database.
 * 'Legit' version: robust error handling, UA rotation, better parsing.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser, Element } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration
const REQUEST_TIMEOUT = 15000;
const MAX_RETRIES = 2;

// User Agents to rotate
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

interface Vendor {
    id: string;
    name: string;
    slug: string;
    website_url: string;
    scrape_config: {
        productSelector: string;
        priceSelector: string;
        nameSelector: string;
        searchUrl?: string; // Specific URL to scrape (e.g. /peptides, /shop)
        headers?: Record<string, string>;
    };
}

interface ScrapedProduct {
    name: string;
    price: number;
    inStock: boolean;
    url?: string;
}

// Target Peptides Definition
const TARGET_PEPTIDES = [
    { name: 'Semaglutide', slug: 'semaglutide', searchTerms: ['semaglutide', 'ozempic', 'wegovy'] },
    { name: 'Tirzepatide', slug: 'tirzepatide', searchTerms: ['tirzepatide', 'mounjaro'] },
    { name: 'Retatrutide', slug: 'retatrutide', searchTerms: ['retatrutide'] },
    { name: 'BPC-157', slug: 'bpc-157', searchTerms: ['bpc-157', 'bpc157', 'body protection compound'] },
    { name: 'TB-500', slug: 'tb-500', searchTerms: ['tb-500', 'tb500', 'thymosin beta'] },
    { name: 'Ipamorelin', slug: 'ipamorelin', searchTerms: ['ipamorelin'] },
    { name: 'CJC-1295 (no DAC)', slug: 'cjc-1295-no-dac', searchTerms: ['cjc-1295', 'cjc1295', 'mod grf'] },
    { name: 'CJC-1295 (DAC)', slug: 'cjc-1295-dac', searchTerms: ['cjc-1295 dac', 'cjc1295 dac', 'drug affinity complex'] },
    { name: 'Melanotan II', slug: 'melanotan-ii', searchTerms: ['melanotan ii', 'melanotan 2', 'mt2', 'mt 2'] },
    { name: 'PT-141', slug: 'pt-141', searchTerms: ['pt-141', 'pt141', 'bremelanotide'] },
    { name: 'AOD-9604', slug: 'aod-9604', searchTerms: ['aod-9604', 'aod9604'] },
    { name: 'GHK-Cu', slug: 'ghk-cu', searchTerms: ['ghk-cu', 'ghkcu', 'copper peptide'] },
    { name: 'GHRP-2', slug: 'ghrp-2', searchTerms: ['ghrp-2', 'ghrp2'] },
    { name: 'GHRP-6', slug: 'ghrp-6', searchTerms: ['ghrp-6', 'ghrp6'] },
    { name: 'Hexarelin', slug: 'hexarelin', searchTerms: ['hexarelin'] },
    { name: 'MK-677', slug: 'mk-677', searchTerms: ['mk-677', 'mk677', 'ibutamoren'] },
    { name: 'Semax', slug: 'semax', searchTerms: ['semax'] },
    { name: 'Selank', slug: 'selank', searchTerms: ['selank'] },
    { name: 'Epithalon', slug: 'epithalon', searchTerms: ['epithalon', 'epitalon'] },
    { name: 'MOTS-c', slug: 'mots-c', searchTerms: ['mots-c', 'motsc'] },
    { name: 'Tesofensine', slug: 'tesofensine', searchTerms: ['tesofensine'] },
    { name: '5-Amino-1MQ', slug: '5-amino-1mq', searchTerms: ['5-amino-1mq', '5-amino'] },
];

/**
 * Robust fetch with retries, timeout, and random UA
 */
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    // Simple AbortController for timeout
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: controller.signal
        });
        clearTimeout(id);

        if (response.status === 429 || (response.status >= 500 && retries > 0)) {
            // Exponential backoff
            const waitTime = 1000 * Math.pow(2, MAX_RETRIES - retries);
            console.log(`Retrying ${url} in ${waitTime}ms... (Status: ${response.status})`);
            await new Promise(r => setTimeout(r, waitTime));
            return fetchWithRetry(url, retries - 1);
        }

        return response;
    } catch (err) {
        clearTimeout(id);
        if (retries > 0 && err.name !== 'AbortError') {
            console.log(`Retrying ${url} due to error: ${err.message}`);
            await new Promise(r => setTimeout(r, 1000));
            return fetchWithRetry(url, retries - 1);
        }
        throw err;
    }
}

/**
 * Extract price from text (handles ranges, currencies, messy text)
 */
function extractPrice(text: string): number | null {
    if (!text) return null;

    // Sometimes price is a range "$50.00 - $100.00", typically take the lower one
    let cleaned = text.split('-')[0]; // Take first part

    // Remove everything that isn't a digit or dot
    // However, some currencies use comma as decimal. 
    // We assume US-centric sites here based on the target vendors.
    cleaned = cleaned.replace(/[^0-9.]/g, '');

    // If there are multiple dots, it might be weird formatting or thousands separator?
    // Usually scraping yields "249.00".
    const price = parseFloat(cleaned);

    return isNaN(price) ? null : price;
}

/**
 * Normalize peptide name for matching
 */
function normalizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Find matching peptide from our list
 */
function findMatchingPeptide(productName: string): { name: string; slug: string } | null {
    const normalizedProduct = normalizeName(productName);

    for (const peptide of TARGET_PEPTIDES) {
        for (const term of peptide.searchTerms) {
            const normalizedTerm = normalizeName(term);
            if (normalizedProduct.includes(normalizedTerm)) {
                return { name: peptide.name, slug: peptide.slug };
            }
        }
    }
    return null;
}

/**
 * Scrape a vendor's website
 */
async function scrapeVendor(vendor: Vendor): Promise<{
    products: ScrapedProduct[];
    errors: string[];
}> {
    const products: ScrapedProduct[] = [];
    const errors: string[] = [];

    try {
        const targetUrl = vendor.scrape_config?.searchUrl || `${vendor.website_url}/peptides`;
        console.log(`Fetching: ${targetUrl}`);

        const response = await fetchWithRetry(targetUrl);

        if (!response.ok) {
            // Throw error to be caught by catch block
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        if (!doc) throw new Error('Failed to parse HTML');

        // Config validation
        const config = vendor.scrape_config;
        if (!config.productSelector || !config.nameSelector || !config.priceSelector) {
            throw new Error('Missing selector configuration');
        }

        const productElements = doc.querySelectorAll(config.productSelector);
        console.log(`Found ${productElements.length} elements using selector: ${config.productSelector}`);

        if (productElements.length === 0) {
            // Log sample HTML if nothing found (truncated)
            console.log("No elements found. HTML Preview: ", html.substring(0, 300));
        }

        for (const element of productElements) {
            try {
                // Name match
                // Try configured selector, then fallback to looking for any heading
                let nameEl = element.querySelector(config.nameSelector);
                let name = nameEl?.textContent?.trim();

                // Fallback: Check for link title or img alt if name empty
                if (!name) {
                    const link = element.querySelector('a');
                    name = link?.getAttribute('title')?.trim() || link?.textContent?.trim();
                }

                if (!name) continue;

                // Peptide Match
                const matchedPeptide = findMatchingPeptide(name);
                if (!matchedPeptide) continue;

                // Price extraction
                const priceEl = element.querySelector(config.priceSelector);
                const priceText = priceEl?.textContent || '';
                const price = extractPrice(priceText);

                if (price === null || price <= 0) continue;

                // Stock status
                // Default true, look for negative signals
                let inStock = true;
                const outOfStockEl = element.querySelector('.out-of-stock, .soldout, .sold-out, [class*="unavailable"], .stock.out-of-stock');
                if (outOfStockEl) inStock = false;

                if (element.textContent.toLowerCase().includes('out of stock') ||
                    element.textContent.toLowerCase().includes('sold out')) {
                    inStock = false;
                }

                // Push valid product
                // Deduplicate: if we already have this peptide for this vendor in this scrape run, 
                // keep the lower price (unlikely case, but possible)
                const existingIndex = products.findIndex(p => p.name === matchedPeptide.name);
                if (existingIndex >= 0) {
                    if (products[existingIndex].price > price) {
                        products[existingIndex] = { name: matchedPeptide.name, price, inStock };
                    }
                } else {
                    products.push({
                        name: matchedPeptide.name,
                        price,
                        inStock,
                    });
                }

                // console.log(`Found ${matchedPeptide.name}: $${price}`);
            } catch (err) {
                // Continue despite single product parsing error
            }
        }

    } catch (err) {
        errors.push(`Failed: ${err.message}`);
        console.error(`Error scraping ${vendor.name}:`, err);
    }

    return { products, errors };
}

async function updatePrices(
    supabase: ReturnType<typeof createClient>,
    vendorId: string,
    products: ScrapedProduct[]
): Promise<number> {
    let updatedCount = 0;

    for (const product of products) {
        const peptideSlug = TARGET_PEPTIDES.find(p => p.name === product.name)?.slug;
        if (!peptideSlug) continue;

        // Upsert
        const { error } = await supabase.from('peptide_prices').upsert({
            vendor_id: vendorId,
            peptide_name: product.name,
            peptide_slug: peptideSlug,
            price: product.price,
            in_stock: product.inStock,
            last_verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'vendor_id,peptide_slug'
        });

        if (!error) {
            updatedCount++;

            // Check for price change to log history
            // We'll just insert history every successful scrape for now as per "Legit" tracking requirements
            // Ideally we check if price changed from last history, but that's an optimization.
            const { data: currentPrice } = await supabase
                .from('peptide_prices')
                .select('id')
                .eq('vendor_id', vendorId)
                .eq('peptide_slug', peptideSlug)
                .single();

            if (currentPrice) {
                await supabase.from('price_history').insert({
                    peptide_price_id: currentPrice.id,
                    price: product.price
                });
            }
        }
    }
    return updatedCount;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    const startTime = Date.now();
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Optional: Run for specific vendor
        let vendorSlug = null;
        try {
            const body = await req.json();
            vendorSlug = body.vendor_slug;
        } catch { }

        let query = supabase.from('vendors').select('*').eq('is_active', true);
        if (vendorSlug) query = query.eq('slug', vendorSlug);

        const { data: vendors, error } = await query;
        if (error || !vendors?.length) throw new Error('No vendors found');

        const results = [];

        for (const vendor of vendors) {
            console.log(`--- Scraping ${vendor.name} ---`);
            const start = Date.now();
            const { products, errors } = await scrapeVendor(vendor as Vendor);
            const duration = Date.now() - start;

            const count = await updatePrices(supabase, vendor.id, products);

            // Log
            await supabase.from('scrape_logs').insert({
                vendor_id: vendor.id,
                status: errors.length ? (products.length > 0 ? 'partial' : 'failed') : 'success',
                products_found: products.length,
                products_updated: count,
                error_message: errors.join('; '),
                duration_ms: duration
            });

            await supabase.from('vendors').update({ last_scraped_at: new Date().toISOString() }).eq('id', vendor.id);

            results.push({ vendor: vendor.name, found: products.length, updated: count, errors });

            // Nice delay between vendors
            await new Promise(r => setTimeout(r, 2000));
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
