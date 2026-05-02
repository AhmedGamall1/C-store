import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',

    include: ['src/**/*.test.js', 'tests/**/*.test.js'],

    // setup files to run before each test file
    setupFiles: [],

    pool: 'forks',

    reporters: ['default'],
  },
})
