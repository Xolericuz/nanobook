import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'NanoBook Quantum',
        short_name: 'NanoBook',
        description: 'Zamonaviy kitobxonlik ilovasi',
        theme_color: '#030306',
        background_color: '#030306',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' }]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
  resolve: { alias: { '@': '/src' } }
})