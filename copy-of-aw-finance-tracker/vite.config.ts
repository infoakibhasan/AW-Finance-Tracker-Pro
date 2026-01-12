import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Ensures process.env.API_KEY is replaced with the actual environment variable 
    // during the build process on platforms like Netlify.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  base: './', // Relative base path for flexible deployment scenarios
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunking strategy to optimize initial load time
          vendor: ['react', 'react-dom', 'react-router-dom', 'recharts'],
        },
      },
    },
  },
});