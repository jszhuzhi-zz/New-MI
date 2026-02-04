import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { resolve } from 'path';

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@link-reit/types': resolve(__dirname, '../../packages/shared/types/src'),
      '@link-reit/i18n': resolve(__dirname, '../../packages/shared/i18n/src'),
    },
  },
  build: {
    minify: 'terser',
    sourcemap: false,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '',
      },
    },
  },
});
