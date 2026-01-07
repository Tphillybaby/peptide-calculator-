import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import Sitemap from 'vite-plugin-sitemap'

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
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // React core - rarely changes, cache long-term
              if (id.includes('react-dom') || id.includes('/react/')) {
                return 'react-vendor';
              }
              // React Router - separate from core
              if (id.includes('react-router')) {
                return 'router';
              }
              // Supabase - auth and database
              if (id.includes('@supabase')) {
                return 'supabase';
              }
              // Charts - only loaded on pages that need them
              if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('recharts')) {
                return 'charts';
              }
              // Icons - large library, separate chunk
              if (id.includes('lucide-react')) {
                return 'icons';
              }
              // Date utilities
              if (id.includes('date-fns') || id.includes('dayjs') || id.includes('moment')) {
                return 'date-utils';
              }
              // PDF generation
              if (id.includes('jspdf') || id.includes('pdf')) {
                return 'pdf';
              }
              // Everything else
              return 'vendor';
            }
          }
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.js',
    }
  }
})
