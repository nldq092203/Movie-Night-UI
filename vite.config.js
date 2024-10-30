import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',  // Output folder for Vite build
    chunkSizeWarningLimit: 500  // Increase limit if you see chunk size warnings
  },
  server: {
    port: 5173,  // Default port for dev
    strictPort: true  // Ensures Vite fails if port 5173 is taken
  }
});