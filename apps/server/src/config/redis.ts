import { Redis } from 'ioredis'
import { env } from './env.js'

const redis = new Redis(env.REDIS_URL, {
  // If Redis is unreachable, fail a command after 3 tries instead of
  // hanging the request forever.
  maxRetriesPerRequest: 3,
})

redis.on('connect', () => console.log('✅ Redis connected'))
redis.on('error', (err) => console.error('❌ Redis error:', err.message))

export default redis
