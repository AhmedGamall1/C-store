import crypto from 'crypto'
import redis from '../config/redis.js'

const TTL_SECONDS = 60 * 60 * 24 // 24 hours
const keyOf = (hash: string) => `email-verify:${hash}`

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
