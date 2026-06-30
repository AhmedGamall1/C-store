import { vi } from 'vitest'

// Global test doubles for the infra the new auth flow depends on, so the suite
// needs ONLY Postgres (no real Redis, no SMTP). These run before any test file
// imports `app`, so the mocks are in place by the time the routes load.

// ── Redis: tiny in-memory stand-in ─────────────────────
// Covers exactly what token.service / verification.service / idempotency use:
// set (with optional EX ttl + NX flag), get, del, getdel.
vi.mock('../../src/config/redis.js', () => {
  const store = new Map()
  const client = {
    async set(key, value, ...opts) {
      // opts looks like ['EX', ttl] and/or ['NX']
      if (opts.includes('NX') && store.has(key)) return null
      store.set(key, value)
      return 'OK'
    },
    async get(key) {
      return store.has(key) ? store.get(key) : null
    },
    async del(key) {
      return store.delete(key) ? 1 : 0
    },
    async getdel(key) {
      if (!store.has(key)) return null
      const value = store.get(key)
      store.delete(key)
      return value
    },
  }
  return { default: client }
})

// ── Rate limiting: disabled in tests ───────────────────
// Counters live in Redis and would bleed across files, 429-ing later requests.
// No-op limiters keep the suite deterministic (and skip the RedisStore entirely).
vi.mock('../../src/middlewares/rateLimit.middleware.js', () => ({
  generalLimiter: (_req, _res, next) => next(),
  authLimiter: (_req, _res, next) => next(),
}))

// ── Email: never hit Gmail SMTP ────────────────────────
vi.mock('../../src/services/email.service.js', () => ({
  sendVerificationEmail: vi.fn(async () => {}),
  sendPasswordResetEmail: vi.fn(async () => {}),
}))
