// FILE: vite.config.ts (Project Root)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // CRITICAL FIX: Resolve Mapbox/Serverless Module Conflict
  optimizeDeps: {
    // 1. Force Vite to recognize react-map-gl as a dependency
    include: ['react-map-gl'] 
  },
  
  build: {
    outDir: 'dist', 
    
    // 2. Explicitly define commonjs options to solve the missing specifier error
    commonjsOptions: {
      include: [/node_modules/],
      strictRequires: true,
    },
    
    // FINAL FIX: Tell Rollup to externalize the problematic library to bypass the error
    rollupOptions: {
      external: [
        'react-map-gl', // Exclude it from the build resolution process
      ],
    },
  },

  // Ensure routing works correctly (for local development)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});