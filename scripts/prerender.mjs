/**
 * Prerender Script for SEO — Lightweight Static HTML Generator
 *
 * Replaces the broken @prerenderer/prerenderer (incompatible with Node 22).
 * No Puppeteer required.
 *
 * Strategy:
 *   1. Fetch all peptide data from Supabase at build time
 *   2. For each peptide, clone dist/index.html and inject:
 *        - Correct <title>, <meta description>, canonical, OG/Twitter tags
 *        - JSON-LD structured data
 *        - Peptide content in #root so Google sees it before JS runs
 *   3. Write dist/encyclopedia/<slug>/index.html
 *
 * Google's crawler runs JavaScript, so users always get the full interactive
 * React app. The prerendered HTML is the "first frame" Google indexes.
 *
 * Usage (called automatically by `npm run build:full`):
 *   node scripts/prerender.mjs
 */

import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Must match src/utils/slugify.js exactly so prerendered paths align with
 * what React Router resolves.
 */
const slugify = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/\+/g, '-plus')
        .replace(/&/g, '-and')
        .replace(/[()[\]{}]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
};

/** Escape characters that would break HTML attribute values or body text. */
const esc = (str) =>
    String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

/** Safely parse a field that may arrive as a JSON string or already as an array. */
const parseArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
    }
    return [];
};

// ─── HTML generation ─────────────────────────────────────────────────────────

function generatePeptidePage(templateHtml, peptide) {
    const slug = slugify(peptide.name);
    const canonical = `https://peptidelog.net/encyclopedia/${slug}`;
    const title = `${peptide.name} Protocol & Dosage Guide | PeptideLog`;
    const rawDesc = peptide.description
        || `Complete guide for ${peptide.name}: dosage, protocols, benefits, and side effects.`;
    const description = esc(rawDesc.substring(0, 160));

    const benefits    = parseArray(peptide.benefits);
    const sideEffects = parseArray(peptide.side_effects);
    // half_life_hours is numeric in DB; format it the same way as the frontend hook
    const halfLife    = peptide.half_life_hours ? esc(`${peptide.half_life_hours} hours`) : '';
    // Extract a representative dosage from the first dosage_protocol entry if available
    const protocols   = parseArray(peptide.dosage_protocols);
    const dosage      = protocols[0]?.schedule?.[0]?.dose
                        ? esc(protocols[0].schedule[0].dose)
                        : '';

    // JSON-LD — structured data for rich results
    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Drug',
        name: peptide.name,
        description: peptide.description,
        category: peptide.category,
        url: canonical,
        ...(halfLife   ? { halfLife }   : {}),
        ...(dosage     ? { dosageSchedule: { '@type': 'DoseSchedule', dose: dosage } } : {}),
    });

    // Prerendered body — visible to crawlers, replaced by React on load.
    // Using display:none avoids a flash of unstyled content for real users
    // while still being fully indexed by Google (Google indexes hidden content).
    const benefitItems    = benefits.map(b => `<li>${esc(b)}</li>`).join('');
    const sideEffectItems = sideEffects.map(e => `<li>${esc(e)}</li>`).join('');

    const prerenderBody = `
<div id="peptide-prerender" style="display:none" aria-hidden="true">
  <h1>${esc(peptide.name)}</h1>
  ${peptide.category ? `<p><strong>Category:</strong> ${esc(peptide.category)}</p>` : ''}
  <p>${esc(peptide.description || '')}</p>
  ${halfLife ? `<p><strong>Half-Life:</strong> ${halfLife}</p>` : ''}
  ${dosage   ? `<p><strong>Common Dosage:</strong> ${dosage}</p>` : ''}
  ${benefitItems    ? `<h2>Benefits</h2><ul>${benefitItems}</ul>`       : ''}
  ${sideEffectItems ? `<h2>Side Effects</h2><ul>${sideEffectItems}</ul>` : ''}
</div>`.trim();

    let html = templateHtml;

    // ── <head> replacements ──────────────────────────────────────────────────
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

    html = html.replace(
        /<meta name="description"\s+content="[^"]*"\s*\/>/,
        `<meta name="description" content="${description}" />`
    );
    html = html.replace(
        /<link rel="canonical" href="[^"]*"\s*\/>/,
        `<link rel="canonical" href="${canonical}" />`
    );

    // Open Graph
    html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/>/,
        `<meta property="og:url" content="${canonical}" />`);
    html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/,
        `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description"\s+content="[^"]*"\s*\/>/,
        `<meta property="og:description" content="${description}" />`);

    // Twitter
    html = html.replace(/<meta name="twitter:url" content="[^"]*"\s*\/>/,
        `<meta name="twitter:url" content="${canonical}" />`);
    html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/,
        `<meta name="twitter:title" content="${title}" />`);
    html = html.replace(/<meta name="twitter:description"\s+content="[^"]*"\s*\/>/,
        `<meta name="twitter:description" content="${description}" />`);

    // Inject JSON-LD + prerender marker just before </head>
    html = html.replace(
        '</head>',
        `<script type="application/ld+json">${jsonLd}</script>\n` +
        `<meta name="prerender-status" content="rendered">\n</head>`
    );

    // ── <body> — inject prerendered content into #root ───────────────────────
    html = html.replace('<div id="root">', `<div id="root">\n${prerenderBody}`);

    return html;
}

// ─── Supabase fetch ──────────────────────────────────────────────────────────

async function fetchPeptides() {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn('[Prerender] ⚠️  No Supabase credentials — skipping peptide pages.');
        console.warn('            Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
        return [];
    }

    const supabase = createClient(url, key);
    const { data, error } = await supabase
        .from('peptides')
        .select('name, description, category, half_life_hours, benefits, side_effects, dosage_protocols');

    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function prerender() {
    console.log('[Prerender] 🚀 Starting static HTML generation...\n');

    if (!fs.existsSync(distPath)) {
        console.error('[Prerender] ❌ dist/ not found — run `npm run build` first.');
        process.exit(1);
    }

    const templateHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');

    // Fetch peptides
    let peptides = [];
    try {
        peptides = await fetchPeptides();
        console.log(`[Prerender] Fetched ${peptides.length} peptides from Supabase`);
    } catch (err) {
        console.error('[Prerender] ❌ Failed to fetch peptides:', err.message);
        process.exit(1);
    }

    let success = 0;
    let fail = 0;

    for (const peptide of peptides) {
        try {
            const slug = slugify(peptide.name);
            const dir  = path.join(distPath, 'encyclopedia', slug);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, 'index.html'), generatePeptidePage(templateHtml, peptide));
            success++;
        } catch (err) {
            console.warn(`[Prerender] ⚠️  Failed for "${peptide.name}": ${err.message}`);
            fail++;
        }
    }

    console.log(`\n[Prerender] ✅ ${success} pages generated, ❌ ${fail} failed`);

    // Verify a sample page
    if (success > 0 && peptides[0]) {
        const sampleSlug = slugify(peptides[0].name);
        const samplePath = path.join(distPath, 'encyclopedia', sampleSlug, 'index.html');
        const sample = fs.readFileSync(samplePath, 'utf-8');
        const hasTitle = sample.includes(peptides[0].name);
        const hasPrerender = sample.includes('prerender-status');
        console.log(`\n[Prerender] Sample check for "${peptides[0].name}":`);
        console.log(`  Title injected:         ${hasTitle ? '✅' : '❌'}`);
        console.log(`  Prerender marker found: ${hasPrerender ? '✅' : '❌'}`);
    }

    if (fail > 0 && success === 0) process.exit(1);
}

prerender().catch((err) => {
    console.error('[Prerender] Fatal error:', err);
    process.exit(1);
});
