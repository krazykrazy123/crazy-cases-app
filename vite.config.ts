import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    sourcemap: true   // ← THIS SHOWS REAL FILE NAMES (src/App.tsx:1234)
  },

  server: {
    proxy: {
      '/api': {
        target: 'https://us-central1-crazy-cases-firebase.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
})