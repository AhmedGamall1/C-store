import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],

    fileParallelism: false, // tests share one DB; files MUST run serially

    globalSetup: ['tests/setup/global.js'],
    setupFiles: ['tests/setup/env.js', 'tests/setup/cleanup.js'],

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
