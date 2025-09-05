/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 10000,
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        '**/*.d.ts',
        'node_modules/**',
        'src/**/index.ts'
      ],
    },
  },
})
