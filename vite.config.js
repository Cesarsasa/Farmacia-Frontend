import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
/*
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['farmacia-frontend-nvr7.onrender.com']
  }
})*/


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
   test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  } 
})