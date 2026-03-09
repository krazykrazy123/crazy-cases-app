// vite.config.ts (must be in client root, next to package.json)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://us-central1-crazy-cases-firebase.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[VITE PROXY] Forwarding:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('[VITE PROXY] Response:', proxyRes.statusCode);
          });
          proxy.on('error', (err, req, res) => {
            console.error('[VITE PROXY ERROR]', err);
          });
        }
      }
    }
  }
})