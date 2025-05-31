// filepath: /Users/RayChen/Desktop/CS394/first-repair/vite.config.js
/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js', // Add or update this line
    // ... other test configurations
  },
});