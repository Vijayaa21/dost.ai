import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries chunk
          'vendor-ui': ['framer-motion', 'lucide-react', 'clsx'],
          // MUI chunk (usually large)
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          // Charts chunk
          'vendor-charts': ['recharts'],
          // Utilities chunk
          'vendor-utils': ['axios', 'date-fns', 'zustand', 'react-toastify'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
