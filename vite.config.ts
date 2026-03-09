// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss'),
        require('autoprefixer'),
      ],
    },
  },

  // Root of the project (if your App.tsx is in src/, this is usually fine)
  root: '.',

  // Base public path (important for Vercel — use '/' unless you deploy to subpath)
  base: '/',

  // Resolve aliases (optional but helps with absolute imports)
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // CSS / PostCSS config (fixes Tailwind v4 PostCSS error)
  css: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss'), // NEW - required for Tailwind v4+
        require('autoprefixer'),
      ],
    },
  },

  // Build optimizations (helps with Vercel 8GB limit & faster builds)
  build: {
    sourcemap: mode === 'development', // disable sourcemaps in production
    minify: 'esbuild', // default, fast
    target: 'esnext', // modern browsers
    chunkSizeWarningLimit: 1000, // increase limit to avoid warnings
  },

  // Server proxy to Firebase Functions (your existing config, improved logging)
  server: {
    proxy: {
      '/api': {
        target: 'https://us-central1-crazy-cases-firebase.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[PROXY REQ]', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('[PROXY RES]', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.error('[PROXY ERROR]', err);
          });
        },
      },
    },
  },

  // Optional: if you have public folder issues on Vercel
  publicDir: 'public',
}));