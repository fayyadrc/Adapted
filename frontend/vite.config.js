import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',  // Use esbuild (built-in) instead of terser
    target: 'es2020'
  },
  esbuild: {
    drop: ['console', 'debugger']  // Remove console.log and debugger in production
  },
  server: {
    port: 5173,
    strictPort: true
  },
  preview: {
    port: 4173,
    strictPort: true
  }
})
