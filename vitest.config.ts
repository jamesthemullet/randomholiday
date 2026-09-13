import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    passWithNoTests: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['lib/**', 'components/**', 'app/**'],
      exclude: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*'],
      thresholds: {
        'lib/**': { lines: 100, functions: 100, branches: 95, statements: 100 },
        'components/**': { lines: 95, functions: 100, branches: 95, statements: 95 },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
