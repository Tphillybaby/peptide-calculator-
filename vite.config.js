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
  const env = loadEnv(mode, process.cwd(), '')

  let dynamicRoutes = [
    '/login',
    '/register',
    '/calculator',
    '/encyclopedia',
    '/schedule',
    '/settings',
    '/forum',
    '/inventory',
    '/price-checker'
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
        dynamicRoutes
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Peptide Tracker',
          short_name: 'PeptideTracker',
          description: 'Track your peptide injections and protocols',
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
            // Vendor chunks - split by major libraries
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react-dom';
              }
              if (id.includes('react-router')) {
                return 'vendor-router';
              }
              if (id.includes('/react/') || id.includes('react-is')) {
                return 'vendor-react';
              }

              // Supabase
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }

              // Icons
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }

              // Charts (heavy)
              if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
                return 'vendor-charts';
              }
              if (id.includes('chart.js') || id.includes('react-chartjs')) {
                return 'vendor-chartjs';
              }

              // PDF (heavy)
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }

              // Date utilities
              if (id.includes('date-fns')) {
                return 'vendor-date';
              }

              // i18n
              if (id.includes('i18next')) {
                return 'vendor-i18n';
              }

              // Sentry
              if (id.includes('@sentry')) {
                return 'vendor-sentry';
              }

              // Helmet/SEO
              if (id.includes('helmet')) {
                return 'vendor-seo';
              }

              // Everything else goes to a common vendor chunk
              return 'vendor-common';
            }

            // App chunks - split by feature area
            if (id.includes('/pages/admin/')) {
              return 'app-admin';
            }
            if (id.includes('/pages/guides/')) {
              return 'app-guides';
            }
            if (id.includes('/components/Admin')) {
              return 'app-admin-components';
            }
          }
        }
      },
      chunkSizeWarningLimit: 600 // Lower threshold for earlier warnings
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.js',
    }
  }
})
