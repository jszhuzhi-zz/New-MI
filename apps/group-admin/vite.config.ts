import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@link-reit/types': path.resolve(__dirname, '../../packages/shared/types/src'),
      '@link-reit/i18n': path.resolve(__dirname, '../../packages/shared/i18n/src'),
      '@link-reit/api-client': path.resolve(__dirname, '../../packages/shared/api-client/src'),
    },
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
