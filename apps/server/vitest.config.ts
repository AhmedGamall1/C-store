import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],

    fileParallelism: false, // tests share one DB; files MUST run serially

    globalSetup: ['tests/setup/global.ts'],
    setupFiles: ['tests/setup/env.ts', 'tests/setup/cleanup.ts'],

    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    testTimeout: 10_000,
    reporters: ['default'],

    coverage: {},
  },
})
