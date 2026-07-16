import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'app-icon.svg',
        'maskable-icon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-512x512.png',
        'pwa-screenshot-desktop.png',
        'pwa-screenshot-mobile.png',
      ],
      manifest: {
        id: '/',
        name: 'Moto Mate',
        short_name: 'Moto Mate',
        description: 'Mobile-first motorcycle maintenance tracking for mileage and date-based service schedules.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#0D0D0D',
        theme_color: '#FFB300',
        categories: ['utilities', 'productivity'],
        screenshots: [
          {
            src: '/pwa-screenshot-desktop.png',
            sizes: '1600x900',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Moto Mate dashboard with maintenance alerts in a wide desktop layout',
          },
          {
            src: '/pwa-screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            label: 'Moto Mate mobile dashboard showing due maintenance tasks and quick actions',
          },
        ],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'moto-mate-api-cache',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
