import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.worktrees', 'dist', 'android'],
    coverage: {
      provider: 'v8',
      include: ['services/**/*.ts', 'components/**/*.tsx', 'utils/**/*.ts'],
      exclude: ['**/__tests__/**', '**/types*.ts'],
    },
  },
});
