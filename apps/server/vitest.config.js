import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],

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

    coverage: {
      provider: 'v8',

      // What to measure coverage on. We want src/, NOT tests themselves.
      include: ['src/**/*.js'],

      // Files that exist but have no real logic to test.
      exclude: [
        'src/index.js', // server bootstrap — covered by smoke
        'src/config/**', // env + db wiring — exercised everywhere
        'src/jobs/**', // background jobs — separate test strategy
        '**/*.test.js',
      ],

      // Multiple report formats:
      // - 'text' prints a table to the terminal
      // - 'html' generates a browsable report in coverage/index.html
      // - 'json-summary' is machine-readable (used by CI for PR comments)
      reporter: ['text', 'html', 'json-summary'],

      // Output directory — already gitignored from Phase 1.
      reportsDirectory: './coverage',

      // Thresholds intentionally NOT set yet. When you have ~70%+ real
      // coverage on critical paths, uncomment and tune:
      //
      // thresholds: {
      //   lines: 70,
      //   functions: 70,
      //   branches: 60,
      //   statements: 70,
      // },
    },
  },
})
