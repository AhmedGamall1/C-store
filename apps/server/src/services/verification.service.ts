import crypto from 'crypto'
import redis from '../config/redis.js'

// for email verify
const TTL_SECONDS = 60 * 60 * 24 // 24 hours
const keyOf = (hash: string) => `email-verify:${hash}`
// for pass reset
const RESET_TTL = 60 * 30 // 30 minutes
const resetKey = (hash: string) => `pw-reset:${hash}`

const hashToken = (raw: string) =>
  crypto.createHash('sha256').update(raw).digest('hex')

// Make a token, save hash -> userId in Redis (24h)
export const createEmailVerifyToken = async (userId: string) => {
  const rawToken = crypto.randomBytes(32).toString('hex')
  await redis.set(keyOf(hashToken(rawToken)), userId, 'EX', TTL_SECONDS)
  return rawToken
}

// Check a raw token: return userId and delete it in one atomic step.
export const consumeEmailVerifyToken = async (rawToken: string) => {
  return redis.getdel(keyOf(hashToken(rawToken))) // userId, or null if bad/expired
}

export const createPasswordResetToken = async (userId: string) => {
  const rawToken = crypto.randomBytes(32).toString('hex')
  await redis.set(resetKey(hashToken(rawToken)), userId, 'EX', RESET_TTL)
  return rawToken
}
export const consumePasswordResetToken = (rawToken: string) =>
  redis.getdel(resetKey(hashToken(rawToken)))
