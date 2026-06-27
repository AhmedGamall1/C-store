import type { Request, Response, NextFunction } from 'express'
import redis from '../config/redis.js'
import AppError from '../utils/AppError.js'

const TTL_SECONDS = 60 * 10 // 10 min
const keyOf = (k: string) => `idem:${k}`

export const idempotency = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.header('Idempotency-Key')
  if (!key) return next()

  const redisKey = keyOf(key)

  const claimed = await redis.set(redisKey, 'pending', 'EX', TTL_SECONDS, 'NX')

  if (!claimed) {
    const stored = await redis.get(redisKey)
    if (!stored || stored === 'pending') {
      // a request with this key is still in processing
      throw new AppError('This request is already being processed', 409)
    }
    const { statusCode, body } = JSON.parse(stored)
    res.status(statusCode).json(body) // replay the saved response
    return
  }

  // We own the key — capture the response so duplicates can replay it.
  const sendJson = res.json.bind(res)
  res.json = ((body: unknown) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      void redis.set(
        redisKey,
        JSON.stringify({ statusCode: res.statusCode, body }),
        'EX',
        TTL_SECONDS
      )
    } else {
      void redis.del(redisKey)
    }
    return sendJson(body)
  }) as Response['json']

  next()
}
