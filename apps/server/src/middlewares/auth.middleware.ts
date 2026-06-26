import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction, RequestHandler } from 'express'
import type { Role } from '@prisma/client'
import AppError from '../utils/AppError.js'
import { env } from '../config/env.js'
import * as userRepo from '../repositories/user.repository.js'

interface TokenPayload {
  id: string
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken

  if (!token) {
    throw new AppError('You are not logged in', 401)
  }

  let decoded: TokenPayload
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload
  } catch {
    throw new AppError('Invalid or expired token', 401)
  }

  const user = await userRepo.findUserById(decoded.id)

  if (!user) {
    throw new AppError('User no longer exists', 401)
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 403)
  }

  req.user = user
  next()
}

// Run AFTER `protect`: block logged-in users who have not verified their email.
export const requireVerified: RequestHandler = (req, res, next) => {
  if (!req.user?.emailVerified) {
    throw new AppError('Please verify your email first', 403)
  }
  next()
}

export const restrictTo =
  (...roles: Role[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(
        'You do not have permission to perform this action',
        403
      )
    }
    next()
  }

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload
    const user = await userRepo.findUserById(decoded.id)

    if (user?.isActive) {
      req.user = user
    }
  } catch {
    // invalid/expired token — treat as guest, do not fail the request
  }

  next()
}
