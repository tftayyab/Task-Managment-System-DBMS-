import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/tasks': 'http://localhost:3000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const norm = id.replace(/\\/g, '/');
          if (!norm.includes('node_modules')) return;
          if (norm.includes('chart.js') || norm.includes('react-chartjs-2')) {
            return 'vendor-charts';
          }
          if (norm.includes('framer-motion')) {
            return 'vendor-motion';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
