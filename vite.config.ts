import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'https://sanarte.vercel.app',
          changeOrigin: true,
          secure: true,
        }
      }
    },
    plugins: [
      react(),
      // Bundle size visualizer — generates dist/stats.html after `npm run build`
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'logo.svg'],
        devOptions: {
          enabled: true
        },
        manifest: {
          name: 'SanArte - Tu Guía de Autosanación',
          short_name: 'SanArte',
          description: 'Descubre el mensaje emocional de tus síntomas y sana desde el alma.',
          theme_color: '#060D1B',
          background_color: '#060D1B',
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
            }
          ]
        }
      })
    ],
    define: {
      'process.env': {}
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
