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
      '@link-reit/utils': path.resolve(__dirname, '../../packages/shared/utils/src'),
    },
  },
  server: {
    port: 3003,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
