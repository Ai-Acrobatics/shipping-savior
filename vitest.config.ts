import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest config for Shipping Savior (AI-8783).
 *
 * Unit-only — Playwright handles E2E, see playwright.config.ts.
 * - Resolves the `@/*` alias from tsconfig.json so test files can import
 *   production modules with the same paths the app uses.
 * - jsdom env so component-style tests can render React if/when added.
 * - Excludes the `e2e/` dir and any node_modules so vitest never tries to
 *   collect Playwright specs.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules/**', '.next/**', 'e2e/**', 'dist/**'],
    setupFiles: [],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.test.ts', 'src/lib/db/schema.ts'],
    },
  },
});
