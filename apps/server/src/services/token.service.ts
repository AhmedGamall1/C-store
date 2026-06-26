import crypto from 'crypto'
import jwt, { type SignOptions } from 'jsonwebtoken'
import type { Role } from '@prisma/client'
import { env } from '../config/env.js'
import redis from '../config/redis.js'
import AppError from '../utils/AppError.js'

const ACCESS_TTL = '15m'
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days
const familyKey = (familyId: string) => `refresh:${familyId}`

interface RefreshPayload {
  id: string // user id
  fam: string // family (session) id
  jti: string // the current vaild refresh token
}

// access token
export const signAccessToken = (id: string, role: Role) =>
  jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: ACCESS_TTL as SignOptions['expiresIn'],
  })

// refresh token
const signRefreshToken = (payload: RefreshPayload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL_SECONDS })

// Start a NEW session (login/register).
export const issueRefreshToken = async (userId: string) => {
  const fam = crypto.randomUUID()
  const jti = crypto.randomUUID()
  await redis.set(familyKey(fam), jti, 'EX', REFRESH_TTL_SECONDS)
  return signRefreshToken({ id: userId, fam, jti })
}

// Rotate on /refresh -> returns new refresh token, or throws on reuse/invalid.
export const rotateRefreshToken = async (token: string) => {
  let payload: RefreshPayload
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload
  } catch {
    throw new AppError('Invalid or expired session', 401)
  }

  const currentJti = await redis.get(familyKey(payload.fam))
  if (!currentJti)
    throw new AppError('Session expired, please log in again', 401)

  // an OLD token was reused -> theft. Kill the whole family.
  if (currentJti !== payload.jti) {
    await redis.del(familyKey(payload.fam))
    throw new AppError('Session reuse detected, please log in again', 401)
  }

  // valid -> rotate: new jti, same family
  const newJti = crypto.randomUUID()
  await redis.set(familyKey(payload.fam), newJti, 'EX', REFRESH_TTL_SECONDS)
  const refreshToken = signRefreshToken({
    id: payload.id,
    fam: payload.fam,
    jti: newJti,
  })
  return { userId: payload.id, refreshToken }
}

// Logout -> kill this session.
export const revokeRefreshToken = async (token: string) => {
  try {
    const { fam } = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload
    await redis.del(familyKey(fam))
  } catch {
    //
  }
}
