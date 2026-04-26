import jwt from 'jsonwebtoken'
import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'
import { env } from '../config/env.js'

export const protect = async (req, res, next) => {
  let token

  // check cookie first
  if (req.cookies?.token) {
    token = req.cookies.token
  }

  if (!token) {
    throw new AppError('You are not logged in', 401)
  }

  const decoded = jwt.verify(token, env.JWT_SECRET)

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  })

  if (!user) {
    throw new AppError('User no longer exists', 401)
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 403)
  }

  req.user = user
  next()
}

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        'You do not have permission to perform this action',
        403
      )
    }
    next()
  }
}

export const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.token

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (user && user.isActive) {
      req.user = user
    }
  } catch {
    // invalid/expired token — treat as guest, do not fail the request
  }

  next()
}
