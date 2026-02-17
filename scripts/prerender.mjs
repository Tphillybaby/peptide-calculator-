/**
 * Prerender Script for SEO
 * 
 * This script prerenders static HTML for all public routes to help Google index them.
 * It runs after the standard Vite build and generates prerendered HTML files.
 */

import { Prerenderer } from '@prerenderer/prerenderer';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');

// Static routes that should always be prerendered
const staticRoutes = [
    '/',
    '/calculator',
    '/half-life',
    '/price-checker',
    '/encyclopedia',
    '/guides',
    '/guides/beginner',
    '/guides/injection',
    '/guides/storage',
    '/safety',
    '/injection-sites',
    '/forum',
    '/terms',
    '/privacy',
];

async function fetchPeptideRoutes() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('[Prerender] No Supabase credentials, skipping peptide routes');
        return [];
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
            .from('peptides')
            .select('name');

        if (error) throw error;

        const routes = data.map(p => `/encyclopedia/${encodeURIComponent(p.name)}`);
        console.log(`[Prerender] Found ${routes.length} peptide routes`);
        return routes;
    } catch (error) {
        console.error('[Prerender] Failed to fetch peptides:', error.message);
        return [];
    }
}

async function prerender() {
    console.log('[Prerender] Starting prerendering process...');

    // Check if dist exists
    if (!fs.existsSync(distPath)) {
        console.error('[Prerender] Error: dist directory not found. Run `npm run build` first.');
        process.exit(1);
    }

    // Get all routes to prerender
    const peptideRoutes = await fetchPeptideRoutes();
    const allRoutes = [...staticRoutes, ...peptideRoutes];

    console.log(`[Prerender] Prerendering ${allRoutes.length} routes...`);

    const prerenderer = new Prerenderer({
        staticDir: distPath,
        renderer: new PuppeteerRenderer({
            headless: true,
            renderAfterDocumentEvent: 'render-complete',
            // Wait for network to be idle (no requests for 500ms)
            renderAfterTime: 2000,
            // Increase timeout for slower pages
            timeout: 60000,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }),
    });

    try {
        await prerenderer.initialize();

        // Process routes in batches to avoid memory issues
        const batchSize = 10;
        for (let i = 0; i < allRoutes.length; i += batchSize) {
            const batch = allRoutes.slice(i, i + batchSize);
            console.log(`[Prerender] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allRoutes.length / batchSize)}`);

            const renderedRoutes = await prerenderer.renderRoutes(batch);

            for (const renderedRoute of renderedRoutes) {
                const outputPath = path.join(distPath, renderedRoute.route, 'index.html');
                const outputDir = path.dirname(outputPath);

                // Create directory if it doesn't exist
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }

                // Inject custom event trigger for future renders
                let html = renderedRoute.html;

                // Remove any prerender scripts if present
                html = html.replace(/<script[^>]*data-prerender[^>]*>.*?<\/script>/gi, '');

                // Add prerendered indicator
                html = html.replace('</head>',
                    '<meta name="prerender-status" content="rendered">\n</head>');

                fs.writeFileSync(outputPath, html);
            }
        }

        console.log(`[Prerender] Successfully prerendered ${allRoutes.length} routes!`);
    } catch (error) {
        console.error('[Prerender] Error during prerendering:', error);
        process.exit(1);
    } finally {
        await prerenderer.destroy();
    }
}

prerender().catch(console.error);
