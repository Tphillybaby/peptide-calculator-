/**
 * Vercel Edge Middleware — Social Media Link Preview (OG Tag) Injector
 *
 * Problem: PeptideLog is a SPA (Single-Page App). Social crawlers (iMessage,
 * Twitter, Facebook, Discord, Slack, etc.) do NOT execute JavaScript, so they
 * always read the generic meta tags baked into index.html — making every
 * shared link look identical.
 *
 * Solution: This edge middleware runs BEFORE any asset is served. When it
 * detects a social/bot crawler it returns a tiny HTML shell with the
 * correct, page-specific OG tags. Regular browsers pass through untouched
 * and continue to receive the normal React SPA bundle.
 *
 * For dynamic encyclopedia pages (/encyclopedia/:slug) it fetches the peptide
 * name + description from Supabase so the preview shows the real content.
 */

export const config = {
  // Run on every path — we'll filter inside the handler
  matcher: '/(.*)',
};

// ─── Crawler detection ────────────────────────────────────────────────────────

const CRAWLER_UA_PATTERNS = [
  // iMessage / Apple
  'facebookexternalhit',
  'linkedinbot',
  'twitterbot',
  'whatsapp',
  'telegrambot',
  'slackbot',
  'discordbot',
  'applebot',
  'imessagebot',
  'bot.html',
  'preview',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'w3c_validator',
  'rogerbot',
  'vkShare',
  'W3C_Validator',
  'ia_archiver',
  'Googlebot',
  'bingbot',
  'Baiduspider',
  'DuckDuckBot',
  'Sogou',
  'Exabot',
  'facebot',
  'Yandex',
  'Bytespider',  // TikTok
];

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_UA_PATTERNS.some(p => ua.includes(p.toLowerCase()));
}

// ─── Site-wide defaults ───────────────────────────────────────────────────────

const SITE = 'PeptideLog';
const DOMAIN = 'https://peptidelog.net';
const DEFAULT_IMAGE = `${DOMAIN}/pwa-512x512.png`;
const DEFAULT_TITLE = 'PeptideLog — Free Peptide Calculator, Tracker & Encyclopedia';
const DEFAULT_DESCRIPTION =
  'Calculate reconstitution doses, log injections, browse 190+ peptides, compare prices, and manage protocols safely. 100% free.';

// ─── Static route metadata ────────────────────────────────────────────────────

const STATIC_ROUTES = {
  '/': {
    title: 'PeptideLog — Free Peptide Calculator, Tracker & Encyclopedia',
    description:
      'The #1 free peptide calculator and tracker. Calculate doses, log injections, browse 190+ peptides, compare prices, and manage protocols safely.',
  },
  '/calculator': {
    title: 'Peptide Reconstitution Calculator — Free & Accurate | PeptideLog',
    description:
      'Free peptide reconstitution calculator. Enter your vial size, water amount, and desired dose to get precise syringe units. Supports U-100, U-50, and U-40 syringes.',
  },
  '/encyclopedia': {
    title: 'Peptide Encyclopedia — 190+ Peptides with Dosage & Protocols | PeptideLog',
    description:
      'Browse 190+ research peptides. Dosage guides, half-lives, protocols, benefits, side effects, and clinical research for BPC-157, Semaglutide, TB-500, and more.',
  },
  '/price-checker': {
    title: 'Peptide Price Checker — Compare Vendor Prices | PeptideLog',
    description:
      'Compare peptide prices across vendors in real time. Find the best deals on BPC-157, Semaglutide, Tirzepatide, and 100+ more research peptides.',
  },
  '/guides': {
    title: 'Peptide Guides — Beginner to Advanced Protocols | PeptideLog',
    description:
      'Step-by-step guides for peptide beginners and experienced users. Learn reconstitution, injection techniques, storage best practices, and protocol design.',
  },
  '/guides/beginner': {
    title: "Beginner's Guide to Peptides — Getting Started Safely | PeptideLog",
    description:
      'New to peptides? Our comprehensive beginner guide covers everything: what peptides are, how to reconstitute them, dosing basics, and safety essentials.',
  },
  '/guides/injection': {
    title: 'Peptide Injection Guide — Subcutaneous & IM Techniques | PeptideLog',
    description:
      'Learn proper peptide injection techniques with step-by-step instructions for subcutaneous and intramuscular injections. Includes site rotation tips.',
  },
  '/guides/storage': {
    title: 'Peptide Storage Guide — Lyophilized & Reconstituted | PeptideLog',
    description:
      'How to store peptides correctly to preserve potency. Covers lyophilized powder storage, refrigeration after reconstitution, and freeze-thaw best practices.',
  },
  '/half-life': {
    title: 'Peptide Half-Life Calculator | PeptideLog',
    description:
      'Calculate how much peptide remains active in your body over time. Plan your dosing schedule around half-life curves for maximum effectiveness.',
  },
  '/safety': {
    title: 'Peptide Safety Guide — Side Effects, Warnings & Best Practices | PeptideLog',
    description:
      'Comprehensive safety information for research peptides. Learn about side effects, contraindications, drug interactions, and harm-reduction strategies.',
  },
  '/injection-sites': {
    title: 'Peptide Injection Sites Guide — Diagrams & Tips | PeptideLog',
    description:
      'Visual guide to injection sites for subcutaneous and intramuscular peptide injections. Includes rotation schedules to prevent scar tissue.',
  },
  '/forum': {
    title: 'Peptide Community Forum — Questions & Discussion | PeptideLog',
    description:
      'Join the PeptideLog community. Ask questions, share experiences, and discuss protocols with thousands of other peptide enthusiasts.',
  },
  '/reviews': {
    title: 'Peptide Vendor Reviews — Community Ratings | PeptideLog',
    description:
      'Honest community reviews of peptide vendors. See purity test results, pricing comparisons, and reliability scores before you buy.',
  },
  '/stack-builder': {
    title: 'Peptide Stack Builder — Protocol Designer | PeptideLog',
    description:
      'Design your peptide stack with our interactive protocol builder. See interaction warnings, calculate combined costs, and export your schedule.',
  },
  '/research': {
    title: 'Peptide Research Hub — Clinical Studies & Papers | PeptideLog',
    description:
      'Browse curated clinical research and peer-reviewed studies on research peptides. Find PubMed references for BPC-157, TB-500, Ipamorelin, and more.',
  },
  '/interactions': {
    title: 'Peptide Interaction Checker — Drug & Peptide Interactions | PeptideLog',
    description:
      'Check for interactions between peptides, medications, and supplements before starting a protocol. Safety-first peptide interaction database.',
  },
  '/contact': {
    title: 'Contact PeptideLog — Support & Feedback',
    description:
      'Get in touch with the PeptideLog team. Report a bug, suggest a feature, or ask a question about our peptide tools and encyclopedia.',
  },
  '/terms': {
    title: 'Terms of Service | PeptideLog',
    description: 'Read the PeptideLog Terms of Service for rules, disclaimers, and research-only usage guidelines.',
  },
  '/privacy': {
    title: 'Privacy Policy | PeptideLog',
    description: "PeptideLog's privacy policy explaining how we collect, use, and protect your personal data.",
  },
  '/encyclopedia/testosterone': {
    title: 'Testosterone (TRT) Guide — Protocols, Dosing & Safety | PeptideLog',
    description:
      'Comprehensive Testosterone Replacement Therapy guide. Learn about TRT protocols, dosing, administration routes, cycle support, and health monitoring.',
  },
};

// ─── HTML shell builder ───────────────────────────────────────────────────────

function buildOGHtml({ title, description, url, image }) {
  const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeDesc = description.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeUrl = url.replace(/"/g, '&quot;');
  const safeImg = (image || DEFAULT_IMAGE).replace(/"/g, '&quot;');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}"/>
  <link rel="canonical" href="${safeUrl}"/>

  <!-- Open Graph -->
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${safeUrl}"/>
  <meta property="og:title" content="${safeTitle}"/>
  <meta property="og:description" content="${safeDesc}"/>
  <meta property="og:image" content="${safeImg}"/>
  <meta property="og:image:width" content="512"/>
  <meta property="og:image:height" content="512"/>
  <meta property="og:site_name" content="${SITE}"/>
  <meta property="og:locale" content="en_US"/>

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:url" content="${safeUrl}"/>
  <meta name="twitter:title" content="${safeTitle}"/>
  <meta name="twitter:description" content="${safeDesc}"/>
  <meta name="twitter:image" content="${safeImg}"/>
</head>
<body>
  <h1>${safeTitle}</h1>
  <p>${safeDesc}</p>
  <p><a href="${safeUrl}">Visit PeptideLog</a></p>
</body>
</html>`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';

  // Pass non-crawler requests straight through — zero cost
  if (!isCrawler(ua)) {
    return; // undefined = let Vercel handle it normally
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip static assets entirely — bots shouldn't be hitting these anyway
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/assets/') ||
    /\.(js|css|png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf|json|xml|txt)$/.test(pathname)
  ) {
    return;
  }

  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;

  // 1. Try exact static route match
  if (STATIC_ROUTES[pathname]) {
    title = STATIC_ROUTES[pathname].title;
    description = STATIC_ROUTES[pathname].description;
  }
  // 2. Dynamic encyclopedia peptide page
  else if (pathname.startsWith('/encyclopedia/')) {
    const slug = pathname.replace('/encyclopedia/', '');

    // Attempt to fetch peptide data from Supabase at edge runtime.
    // process.env is available in Vercel Edge Runtime; the eslint env doesn't
    // know about it so we access it via globalThis to silence the linter.
    try {
      const env = (typeof globalThis !== 'undefined' && globalThis.process?.env) || {};
      const supabaseUrl = env.VITE_SUPABASE_URL;
      const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        // The peptides table has no slug column — fetch name+description for
        // all rows, then find the one whose slugified name matches the URL slug.
        // We select only what we need and keep the payload small.
        const apiUrl =
          `${supabaseUrl}/rest/v1/peptides?select=name,description&limit=500`;
        const resp = await fetch(apiUrl, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });

        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data)) {
            // Re-implement slugify inline (can't import from src/ at edge)
            const toSlug = (text) =>
              text.toLowerCase()
                .replace(/\+/g, '-plus').replace(/&/g, '-and')
                .replace(/[()[\]{}]/g, '').replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');

            const match = data.find(p => toSlug(p.name) === slug);
            if (match) {
              const desc = match.description
                ? match.description.substring(0, 160)
                : `Complete guide for ${match.name} peptide including dosage, protocols, benefits, and side effects.`;
              title = `${match.name} Protocol & Dosage Guide | PeptideLog`;
              description = desc;
            }
          }
        }
      }
    } catch {
      // Supabase unavailable — fall back to slug-derived title below
    }

    // Fallback: humanize the slug if Supabase didn't return anything
    if (title === DEFAULT_TITLE) {
      const humanName = slug
        .replace(/-plus/g, '+')
        .replace(/-and-/g, ' & ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      title = `${humanName} — Protocol, Dosage & Guide | PeptideLog`;
      description = `Complete guide for ${humanName}: dosage protocols, half-life, benefits, side effects, and clinical research. Free on PeptideLog.`;
    }
  }
  // 3. Guide sub-pages (dynamic slugs we may not have listed)
  else if (pathname.startsWith('/guides/')) {
    const guideSlug = pathname.replace('/guides/', '');
    const guideName = guideSlug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    title = `${guideName} Guide | PeptideLog`;
    description = `Read the ${guideName} guide on PeptideLog — detailed peptide protocols, safety tips, and dosing information.`;
  }

  const fullUrl = `${DOMAIN}${pathname}`;
  const html = buildOGHtml({ title, description, url: fullUrl });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Cache OG responses at the edge for 10 minutes — fast for bots, always fresh-ish
      'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=3600',
    },
  });
}
