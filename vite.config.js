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
          manualChunks: {
            // Keep all React core together to avoid forwardRef issues
            'vendor-react': ['react', 'react-dom', 'react-router-dom', 'scheduler', 'react-is'],
            // Supabase
            'vendor-supabase': ['@supabase/supabase-js'],
            // Icons
            'vendor-icons': ['lucide-react'],
            // Charts (heavy - split into own chunks)
            'vendor-charts': ['recharts'],
            'vendor-chartjs': ['chart.js', 'react-chartjs-2'],
            // PDF (heavy)
            'vendor-pdf': ['jspdf', 'jspdf-autotable', 'html2canvas'],
            // Utilities
            'vendor-utils': ['date-fns', 'uuid'],
            // i18n
            'vendor-i18n': ['i18next', 'react-i18next'],
            // Sentry
            'vendor-sentry': ['@sentry/react']
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
