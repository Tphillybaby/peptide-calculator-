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
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-ui': ['lucide-react'],
            'vendor-charts': ['recharts', 'chart.js', 'react-chartjs-2'],
            'vendor-pdf': ['jspdf', 'jspdf-autotable', 'html2canvas'],
            'vendor-utils': ['date-fns', 'i18next', 'react-i18next', 'uuid']
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
