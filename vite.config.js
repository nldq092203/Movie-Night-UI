import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { config } from 'dotenv';

config(); // Load environment variables from .env

export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 500
  },
  server: {
    port: 5173,
    strictPort: true
  }
});