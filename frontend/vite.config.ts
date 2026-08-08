import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        // This app sits behind Cloudflare Access — every page navigation needs to reach the
        // network so Access can gate it (login redirect when logged out, silent pass-through
        // when authenticated). Workbox's default navigateFallback serves the cached app shell
        // for every navigation instead, which bypasses Access entirely: after a real logout, the
        // page loaded from cache anyway, and its API calls hit a CORS-blocked Access redirect
        // ("Failed to fetch") instead of ever reaching the login page. Disabling it means
        // navigations always hit the network — deep-link routes like /applications/:id are
        // handled instead by the origin's _redirects SPA fallback, which only takes effect once
        // Access has already let the request through.
        navigateFallback: undefined,
      },
      manifest: {
        name: 'CareerRecall',
        short_name: 'CareerRecall',
        description: 'Job application tracker and recruiter-call recall assistant',
        theme_color: '#2a14b4',
        background_color: '#f7f9fb',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Track New Job',
            short_name: 'Track Job',
            description: 'Log a new application — JD and resume',
            url: '/track',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8788',
    },
  },
  preview: {
    proxy: {
      '/api': 'http://localhost:8788',
    },
  },
})
