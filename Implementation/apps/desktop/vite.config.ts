import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer/src'),
      '@jarvis-x/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@jarvis-x/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@jarvis-x/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@jarvis-x/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
