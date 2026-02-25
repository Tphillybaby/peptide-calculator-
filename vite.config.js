import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import Sitemap from 'vite-plugin-sitemap'
import { visualizer } from 'rollup-plugin-visualizer'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '')

  let dynamicRoutes = [
    '/calculator',
    '/encyclopedia',
    '/forum',
    '/price-checker',
    '/guides',
    '/safety',
    '/guides/beginner',
    '/guides/injection',
    '/injection-sites',
    '/reviews',
    '/contact'
  ]

  // Try to fetch peptides for dynamic sitemap
  try {
    if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
      // We need to use 'createClient' from supabase-js, but we need to dynamic import it 
      // or ensure it's available. It is in package.json.
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

      const { data } = await supabase
        .from('peptides')
        .select('name')

      if (data) {
        const peptideRoutes = data.map(p => `/encyclopedia/${encodeURIComponent(p.name)}`)
        dynamicRoutes = [...dynamicRoutes, ...peptideRoutes]
        console.log(`[Sitemap] Added ${peptideRoutes.length} peptide routes`)
      }
    }
  } catch (e) {
    console.warn('[Sitemap] Failed to fetch dynamic routes:', e)
  }

  return {
    plugins: [
      react(),
      Sitemap({
        hostname: 'https://peptidelog.net',
        dynamicRoutes,
        // Custom priority and changefreq based on route importance
        priority: (route) => {
          // Homepage highest priority
          if (route === '/') return 1.0;
          // Main tool pages - high priority
          if (['/calculator', '/encyclopedia', '/price-checker', '/forum'].includes(route)) return 0.9;
          // Guide pages - high priority (these have indexing issues)
          if (route.startsWith('/guides')) return 0.9;
          // Other important static pages
          if (['/safety', '/injection-sites', '/reviews', '/half-life'].includes(route)) return 0.8;
          // Individual peptide pages
          if (route.startsWith('/encyclopedia/')) return 0.7;
          // Default
          return 0.5;
        },
        changefreq: (route) => {
          if (route === '/') return 'daily';
          if (route === '/forum') return 'daily';
          if (route === '/price-checker') return 'daily';
          if (route.startsWith('/encyclopedia')) return 'weekly';
          if (route.startsWith('/guides')) return 'monthly';
          return 'weekly';
        },
        lastmod: new Date().toISOString(),
        // Readable XML output
        readable: true
      }),
      VitePWA({
        registerType: 'autoUpdate',
        // Use inline registration which includes error handling
        injectRegister: 'inline',
        // Disable service worker during development
        devOptions: {
          enabled: false
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'PeptideLog',
          short_name: 'PeptideLog',
          description: 'Your personal peptide calculator, tracker, and encyclopedia',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      }),
      // Bundle analyzer - generates stats.html after build
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
      // Sentry source maps upload (only in production builds with auth token)
      env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
        org: 'phillips-tectical-technologies',
        project: 'javascript-react',
        authToken: env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          // Delete source maps after upload for security
          filesToDeleteAfterUpload: ['./dist/**/*.map'],
        },
        release: {
          // Use git commit hash or build time as release version
          name: env.VERCEL_GIT_COMMIT_SHA || `build-${Date.now()}`,
        },
        // Suppress warnings in CI
        silent: !env.DEBUG,
      }),
    ].filter(Boolean),
    build: {
      // Generate source maps for Sentry (they get deleted after upload)
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Keep React core AND React-dependent chart libraries together
            // Recharts and react-chartjs-2 use React.forwardRef at module evaluation
            // time, so they MUST be in the same chunk as React
            if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/') ||
              id.includes('node_modules/react-is/') ||
              id.includes('node_modules/recharts/') ||
              id.includes('node_modules/react-chartjs-2/')) {
              return 'vendor-react';
            }
            // Supabase
            if (id.includes('node_modules/@supabase/')) {
              return 'vendor-supabase';
            }
            // Icons
            if (id.includes('node_modules/lucide-react/')) {
              return 'vendor-icons';
            }
            // Chart.js core (no React dependency at module level)
            if (id.includes('node_modules/chart.js/')) {
              return 'vendor-chartjs';
            }
            // PDF (heavy)
            if (id.includes('node_modules/jspdf/') ||
              id.includes('node_modules/jspdf-autotable/') ||
              id.includes('node_modules/html2canvas/')) {
              return 'vendor-pdf';
            }
            // Utilities
            if (id.includes('node_modules/date-fns/') || id.includes('node_modules/uuid/')) {
              return 'vendor-utils';
            }
            // i18n
            if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) {
              return 'vendor-i18n';
            }
            // Sentry
            if (id.includes('node_modules/@sentry/')) {
              return 'vendor-sentry';
            }
            // Don't split app source code — let Rollup handle it naturally
            // This prevents TDZ errors from circular/cross-chunk dependencies
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.js',
    }
  }
})
