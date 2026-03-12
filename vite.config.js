import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts
          'vendor-recharts': ['recharts'],
          // PDF renderer (large library, load separately)
          'vendor-pdf': ['@react-pdf/renderer'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // Lucide icons
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
