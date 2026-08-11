import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Enable minification and code splitting for production
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Better chunk splitting for caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    // Performance optimizations
    chunkSizeWarningLimit: 500,
    cssMinify: true,
  },
  // Improve dev server performance
  server: {
    host: true,
  },
  // Enable esbuild for faster builds
  esbuild: {
    logOverride: { 'this-will-be-used-on-minification': 'silent' },
  },
});
