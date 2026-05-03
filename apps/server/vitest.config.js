import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],

    // Run once before the whole suite (migrations).
    globalSetup: ['tests/setup/global.js'],

    // Run inside each test process before tests start.
    // Order matters: env first (so DATABASE_URL is set), then cleanup.
    setupFiles: ['tests/setup/env.js', 'tests/setup/cleanup.js'],

    // Critical: integration tests share one DB — running them in
    // parallel would race on TRUNCATE. Force serial execution.
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    // Integration tests can be slower than unit tests (DB roundtrips).
    testTimeout: 10_000,

    reporters: ['default'],
  },
})
