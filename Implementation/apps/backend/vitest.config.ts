import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'tests/**/*.js',
      'tests/**/*.d.ts',
      'tests/**/*.js.map',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/tests/**',
        '**/*.config.*',
      ],
    },
    alias: {
      '@jarvis-x/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@jarvis-x/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@jarvis-x/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
    },
  },
});
