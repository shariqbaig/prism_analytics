import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // Bundle analyzer for performance monitoring
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // sunburst, treemap, network
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    // Remove console in production builds
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Keep console.error for critical errors
    pure: process.env.NODE_ENV === 'production' ? ['console.log', 'console.debug', 'console.info', 'console.warn'] : [],
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Chart libraries (heavy, separate chunk)
          charts: ['chart.js', 'react-chartjs-2', 'recharts'],
          // Shadcn/UI and Radix components (optimized chunk)
          shadcn: [
            '@radix-ui/react-slot', 
            '@radix-ui/react-toast', 
            '@radix-ui/react-dialog',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            'class-variance-authority'
          ],
          // State management
          stores: ['zustand'],
          // Utility libraries
          utils: ['clsx', 'tailwind-merge', 'lucide-react'],
          // Motion and animations (separate for code splitting)
          motion: ['framer-motion'],
          // Data handling utilities
          data: ['dexie', 'xlsx', 'jspdf']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
