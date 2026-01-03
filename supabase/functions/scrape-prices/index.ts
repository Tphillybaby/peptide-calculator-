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
const REQUEST_TIMEOUT = 150000; // Increased to 150s for slow vendors/proxies
const MAX_RETRIES = 2;

// User Agents to rotate
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
];

// Temporarily disabled vendors (conserve API calls)
const EXCLUDED_VENDORS = ['pure-rawz'];

interface Vendor {
    id: string;
    name: string;
    slug: string;
    website_url: string;
    is_active: boolean;
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
    quantity?: number;      // Amount in mg (or mcg converted to mg)
    unit?: string;          // 'mg', 'mcg', 'iu', 'ml'
    originalName?: string;  // Original product name from site
    pricePerMg?: number;    // Calculated price per mg for comparison
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
    // New popular peptides
    { name: 'NAD+', slug: 'nad-plus', searchTerms: ['nad+', 'nad plus', 'nicotinamide'] },
    { name: 'DSIP', slug: 'dsip', searchTerms: ['dsip', 'delta sleep'] },
    { name: 'Sermorelin', slug: 'sermorelin', searchTerms: ['sermorelin'] },
    { name: 'Fragment 176-191', slug: 'fragment-176-191', searchTerms: ['fragment 176-191', 'hgh fragment', 'frag 176'] },
    { name: 'KPV', slug: 'kpv', searchTerms: ['kpv', 'kpv tripeptide'] },
    { name: 'LL-37', slug: 'll-37', searchTerms: ['ll-37', 'll37', 'cathelicidin'] },
    { name: 'Tesamorelin', slug: 'tesamorelin', searchTerms: ['tesamorelin', 'egrifta'] },
    { name: 'Kisspeptin-10', slug: 'kisspeptin-10', searchTerms: ['kisspeptin', 'kiss-10'] },
    { name: 'Thymulin', slug: 'thymulin', searchTerms: ['thymulin'] },
    { name: 'IGF-1 LR3', slug: 'igf-1-lr3', searchTerms: ['igf-1 lr3', 'igf1 lr3', 'long r3'] },
    { name: 'Follistatin 344', slug: 'follistatin-344', searchTerms: ['follistatin 344', 'follistatin-344', 'fs344'] },
];

/**
 * Robust fetch with retries, timeout, random UA, and Proxy API support
 */
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        // Support for "Scraping" APIs via env vars
        const proxyKey = Deno.env.get('SCRAPING_API_KEY');
        const service = Deno.env.get('SCRAPING_SERVICE_NAME'); // 'zenrows', 'scrapingant'

        let fetchUrl = url;
        let fetchHeaders: Record<string, string> = {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': new URL(url).origin,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Connection': 'keep-alive',
        };

        // Only add Chrome-specific hints if using a Chrome-like UA
        if (userAgent.includes('Chrome')) {
            fetchHeaders['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
            fetchHeaders['Sec-Ch-Ua-Platform'] = '"macOS"';
        }

        if (proxyKey) {
            if (service === 'zenrows') {
                fetchUrl = `https://api.zenrows.com/v1/?apikey=${proxyKey}&url=${encodeURIComponent(url)}&js_render=true&premium_proxy=true`;
                fetchHeaders = {}; // ZenRows handles this
            } else if (service === 'scrapingant') {
                // Enable browser mode for better bot bypass, add wait for dynamic content
                fetchUrl = `https://api.scrapingant.com/v2/general?x-api-key=${proxyKey}&url=${encodeURIComponent(url)}&browser=true&wait_for_selector=.product,.product-item,.price`;
                fetchHeaders = {};
            }
        }

        console.log(`Fetching: ${url} ${proxyKey ? `(via ${service || 'Proxy'})` : '(Direct)'}`);

        const response = await fetch(fetchUrl, {
            headers: fetchHeaders,
            signal: controller.signal
        });
        clearTimeout(id);

        // Handle rate limits or server errors
        if (response.status === 429 || (response.status >= 500 && retries > 0)) {
            const waitTime = 2000 * Math.pow(2, MAX_RETRIES - retries);
            console.log(`Retrying in ${waitTime}ms... (Status: ${response.status})`);
            await new Promise(r => setTimeout(r, waitTime));
            return fetchWithRetry(url, retries - 1);
        }

        return response;
    } catch (err) {
        clearTimeout(id);
        const error = err as Error;
        // Retry on timeout (AbortError) too, as it might be transient network issue
        if (retries > 0) {
            console.log(`Retrying due to error: ${error.message} (${error.name})`);
            await new Promise(r => setTimeout(r, 2000));
            return fetchWithRetry(url, retries - 1);
        }
        throw error;
    }
}

/**
 * Extract price from text (handles ranges, currencies, messy text)
 */
function extractPrice(text: string): number | null {
    if (!text) return null;

    // "From $50.00" -> "50.00"
    // "$50.00 - $100.00" -> "50.00"
    let cleaned = text.split('-')[0];
    cleaned = cleaned.replace(/[^0-9.]/g, '');

    const price = parseFloat(cleaned);
    return isNaN(price) ? null : price;
}

/**
 * Extract quantity (mg/mcg/iu) from product name
 * Examples: "BPC-157 5MG" -> { quantity: 5, unit: 'mg' }
 *           "Semaglutide 10mg vial" -> { quantity: 10, unit: 'mg' }
 *           "GHRP-2 5000mcg" -> { quantity: 5, unit: 'mg' } (converted)
 */
function extractQuantity(productName: string): { quantity: number | null; unit: string | null } {
    if (!productName) return { quantity: null, unit: null };

    const text = productName.toLowerCase();

    // Match patterns like "5mg", "10 mg", "5000mcg", "10iu", "20ml"
    const patterns = [
        /([\d.]+)\s*mg\b/i,
        /([\d.]+)\s*mcg\b/i,
        /([\d.]+)\s*iu\b/i,
        /([\d.]+)\s*ml\b/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            let quantity = parseFloat(match[1]);
            let unit = match[0].replace(/[\d.\s]/g, '').toLowerCase();

            // Convert mcg to mg
            if (unit === 'mcg') {
                quantity = quantity / 1000;
                unit = 'mg';
            }

            return { quantity, unit };
        }
    }

    return { quantity: null, unit: null };
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
 * Scrape a vendor's website (with pagination support)
 */
async function scrapeVendor(vendor: Vendor): Promise<{
    products: ScrapedProduct[];
    errors: string[];
}> {
    const products: ScrapedProduct[] = [];
    const errors: string[] = [];

    try {
        const baseUrl = vendor.scrape_config?.searchUrl || `${vendor.website_url}/peptides`;

        // Maximum pages to scrape (prevent infinite loops)
        const MAX_PAGES = 5;
        let currentPage = 1;
        let hasMorePages = true;

        while (hasMorePages && currentPage <= MAX_PAGES) {
            // Build URL with page parameter
            let targetUrl = baseUrl;
            if (currentPage > 1) {
                // Handle different pagination formats
                // WooCommerce style: /page/2/ (Swiss Chems, etc.)
                // Query string style: ?product-page=2 (Biotech Peptides, etc.)
                if (baseUrl.includes('/product-category/') || baseUrl.includes('/shop/')) {
                    // WooCommerce uses /page/N/ format
                    const cleanUrl = baseUrl.replace(/\/$/, '');
                    targetUrl = `${cleanUrl}/page/${currentPage}/`;
                } else if (baseUrl.includes('?')) {
                    targetUrl = `${baseUrl}&product-page=${currentPage}`;
                } else {
                    targetUrl = `${baseUrl}?product-page=${currentPage}`;
                }
            }

            console.log(`Scraping page ${currentPage}: ${targetUrl}`);

            const response = await fetchWithRetry(targetUrl);

            if (!response.ok) {
                if (currentPage === 1) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                } else {
                    // Later page failed, stop paginating
                    break;
                }
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            if (!doc) {
                if (currentPage === 1) throw new Error('Failed to parse HTML');
                break;
            }

            // Config validation
            const config = vendor.scrape_config;
            if (!config.productSelector || !config.nameSelector || !config.priceSelector) {
                throw new Error('Missing selector configuration');
            }

            const productElements = doc.querySelectorAll(config.productSelector);
            console.log(`Page ${currentPage}: Found ${productElements.length} elements`);

            if (productElements.length === 0) {
                if (products.length === 0 && currentPage === 1) {
                    // Check for bot detection signs
                    const lowerHtml = html.toLowerCase();
                    if (lowerHtml.includes('cloudflare') || lowerHtml.includes('challenge-form') || lowerHtml.includes('verify you are human')) {
                        errors.push(`Bot detection triggered on page 1`);
                        console.log("Bot detection suspected.");
                    } else if (lowerHtml.includes('access denied')) {
                        errors.push(`Access Denied (403/406)`);
                    } else {
                        // Simple substring to avoid regex crash
                        const preview = html.substring(0, 300);
                        console.log("No elements found. HTML Preview: ", preview);
                        errors.push(`No products found on page 1. Config: ${JSON.stringify(config)}`);
                    }
                }
                break; // No more products, stop paginating
            }

            let productsFoundOnPage = 0;
            for (const node of productElements) {
                try {
                    const element = node as Element;
                    let nameEl = element.querySelector(config.nameSelector);
                    let name = nameEl?.textContent?.trim();

                    if (!name) {
                        const link = element.querySelector('a');
                        name = link?.getAttribute('title')?.trim() || link?.textContent?.trim();
                    }

                    // URL extraction
                    let productUrl = element.querySelector('a')?.getAttribute('href');
                    if (productUrl && !productUrl.startsWith('http')) {
                        try {
                            // Handle relative URLs
                            const urlObj = new URL(vendor.website_url);
                            productUrl = `${urlObj.origin}${productUrl.startsWith('/') ? '' : '/'}${productUrl}`;
                        } catch (e) {
                            console.error(`Invalid vendor URL for ${vendor.name}: ${vendor.website_url}`);
                            productUrl = undefined;
                        }
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

                    // Extract quantity from product name
                    const { quantity, unit } = extractQuantity(name);

                    // Calculate price per mg for comparison
                    let pricePerMg: number | undefined;
                    if (quantity && quantity > 0 && unit === 'mg') {
                        pricePerMg = price / quantity;
                    }

                    // Stock status
                    let inStock = true;
                    const outOfStockEl = element.querySelector('.out-of-stock, .soldout, .sold-out, [class*="unavailable"], .stock.out-of-stock');
                    if (outOfStockEl) inStock = false;

                    if (element.textContent.toLowerCase().includes('out of stock') ||
                        element.textContent.toLowerCase().includes('sold out')) {
                        inStock = false;
                    }

                    // Push valid product (deduplicate logic - prefer lower price per mg, or lower price if no mg)
                    const existingIndex = products.findIndex(p => p.name === matchedPeptide.name);
                    if (existingIndex >= 0) {
                        const existing = products[existingIndex];
                        // Compare by price per mg if available, otherwise by price
                        const shouldReplace = pricePerMg && existing.pricePerMg
                            ? pricePerMg < existing.pricePerMg
                            : price < existing.price;
                        if (shouldReplace) {
                            products[existingIndex] = {
                                name: matchedPeptide.name,
                                price,
                                inStock,
                                quantity: quantity || undefined,
                                unit: unit || undefined,
                                originalName: name,
                                pricePerMg,
                                url: productUrl || undefined
                            };
                        }
                    } else {
                        products.push({
                            name: matchedPeptide.name,
                            price,
                            inStock,
                            quantity: quantity || undefined,
                            unit: unit || undefined,
                            originalName: name,
                            pricePerMg,
                            url: productUrl || undefined
                        });
                        productsFoundOnPage++;
                    }
                } catch (err) {
                    // Ignore individual product errors
                }
            }

            // Check for next page link
            const nextPageLink = doc.querySelector('a.next, a[rel="next"], .pagination a:last-child, a[aria-label="Next"]');
            const paginationText = doc.body?.textContent || '';

            // Check if there's indication of more pages
            if (nextPageLink || paginationText.includes(`page=${currentPage + 1}`) || paginationText.includes(`product-page=${currentPage + 1}`)) {
                currentPage++;
                // Small delay between pages
                await new Promise(r => setTimeout(r, 1500));
            } else {
                hasMorePages = false;
            }
        }

        console.log(`Total products found for ${vendor.name}: ${products.length}`);

    } catch (err) {
        const error = err as Error;
        errors.push(`Failed: ${error.message}`);
        console.error(`Error scraping ${vendor.name}:`, error);
    }

    return { products, errors };
}

async function updatePrices(
    supabase: ReturnType<typeof createClient>,
    vendorId: string,
    products: ScrapedProduct[]
): Promise<number> {
    let updatedCount = 0;

    // Deduplicate products by target peptide slug before upserting
    // If multiple products map to the same slug (e.g. 5mg and 10mg versions), 
    // we keep the one matching our logic (lowest price per mg or lowest price)
    const uniqueProducts = new Map<string, ScrapedProduct>();

    for (const product of products) {
        const peptideSlug = TARGET_PEPTIDES.find(p => p.name === product.name)?.slug;
        if (!peptideSlug) continue;

        if (!uniqueProducts.has(peptideSlug)) {
            uniqueProducts.set(peptideSlug, product);
        } else {
            const existing = uniqueProducts.get(peptideSlug)!;
            // Compare by price per mg if available
            if (product.pricePerMg && existing.pricePerMg) {
                if (product.pricePerMg < existing.pricePerMg) {
                    uniqueProducts.set(peptideSlug, product);
                }
            } else if (product.price < existing.price) {
                uniqueProducts.set(peptideSlug, product);
            }
        }
    }

    for (const [slug, product] of uniqueProducts.entries()) {
        const peptideSlug = slug;

        // Upsert
        const { error } = await supabase.from('peptide_prices').upsert({
            vendor_id: vendorId,
            peptide_name: product.name,
            peptide_slug: peptideSlug,
            price: product.price,
            in_stock: product.inStock,
            quantity_mg: product.quantity || null,
            quantity_unit: product.unit || null,
            price_per_mg: product.pricePerMg || null,
            original_product_name: product.originalName || null,
            product_url: product.url || null,
            last_verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'vendor_id,peptide_slug'
        });

        if (!error) {
            updatedCount++;
            const { data: currentPrice } = await supabase
                .from('peptide_prices')
                .select('id')
                .eq('vendor_id', vendorId)
                .eq('peptide_slug', peptideSlug)
                .single();

            if (currentPrice) {
                await supabase.from('price_history').insert({
                    peptide_price_id: currentPrice.id,
                    price: product.price,
                    quantity_mg: product.quantity || null
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

        let vendorSlug = null;
        try {
            const body = await req.json();
            vendorSlug = body.vendor_slug;
        } catch { }

        let query = supabase.from('vendors').select('*');
        // If specific vendor, don't filter by is_active immediately so we can report if it's inactive
        if (vendorSlug) {
            query = query.eq('slug', vendorSlug);
        } else {
            query = query.eq('is_active', true);
        }

        const { data: vendors, error } = await query;
        if (error) throw error;

        if (!vendors?.length) throw new Error('No vendors found matching criteria');

        const typedVendors = vendors as Vendor[];
        const activeVendors = typedVendors.filter(v => v.is_active || vendorSlug === v.slug);

        // Filter out excluded vendors unless specifically requested via slug
        const vendorsToScrape = activeVendors.filter(v =>
            (vendorSlug && v.slug === vendorSlug) || !EXCLUDED_VENDORS.includes(v.slug)
        );

        if (vendorsToScrape.length === 0) {
            if (vendorSlug) throw new Error(`Vendor '${vendorSlug}' is inactive or excluded.`);
            throw new Error('No active vendors to scrape');
        }

        const results = [];

        for (const vendor of vendorsToScrape) {
            console.log(`--- Scraping ${vendor.name} ---`);
            const start = Date.now();
            const { products, errors } = await scrapeVendor(vendor as Vendor);
            const duration = Date.now() - start;

            const count = await updatePrices(supabase, vendor.id, products);

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

            // Delay to avoid bursting
            await new Promise(r => setTimeout(r, 2000));
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err) {
        const error = err as Error;
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
