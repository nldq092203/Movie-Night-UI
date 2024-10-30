import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Listen on all network interfaces (instead of 'localhost')
    port: process.env.PORT || 5173, // Use Railway's PORT or default to 5173
    strictPort: true, // Ensure Vite uses the specified port or fails
  },
});