import rateLimit from 'express-rate-limit'

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // requests per window per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests. Please try again in a few minutes.',
  },
  // Never throttle Paymob's webhook — Paymob retries on its own schedule
  // and a 429 here would corrupt order state.
  skip: (req) => req.originalUrl.startsWith('/api/paymob/webhook'),
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // failed attempts per window per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    message:
      'Too many authentication attempts. Please try again in 15 minutes.',
  },
  skipSuccessfulRequests: true,
})
