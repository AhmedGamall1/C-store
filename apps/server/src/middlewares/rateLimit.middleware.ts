import rateLimit from 'express-rate-limit'
import { RedisStore, type RedisReply } from 'rate-limit-redis'
import redis from '../config/redis.js'

// Each limiter gets its own Redis-backed store + prefix so their counters
// stay separate. All server instances now share these counters.
const makeStore = (prefix: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<RedisReply>,
    prefix,
  })

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: makeStore('rl:general:'),
  message: {
    status: 'error',
    message: 'Too many requests. Please try again in a few minutes.',
  },
  skip: (req) => req.originalUrl.startsWith('/api/paymob/webhook'),
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: makeStore('rl:auth:'),
  message: {
    status: 'error',
    message:
      'Too many authentication attempts. Please try again in 15 minutes.',
  },
  skipSuccessfulRequests: true,
})
