import bcrypt from 'bcrypt'
import jwt, { type SignOptions } from 'jsonwebtoken'
import type { Request, Response, CookieOptions } from 'express'
import type { Role, User } from '@prisma/client'
import AppError from '../utils/AppError.js'
import { env } from '../config/env.js'
import * as userRepo from '../repositories/user.repository.js'

const SESSION_DAYS = 30
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
}

const signToken = (id: string, role: Role): string =>
  jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: `${SESSION_DAYS}d` as SignOptions['expiresIn'],
  })

const sendTokenResponse = (user: User, statusCode: number, res: Response) => {
  const token = signToken(user.id, user.role)
  const { password: _pw, ...safeUser } = user
  res
    .status(statusCode)
    .cookie('token', token, COOKIE_OPTIONS)
    .json({ status: 'success', data: { user: safeUser } })
}

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phone } = req.body

  const existing = await userRepo.findUserByEmail(email)
  if (existing) throw new AppError('User already exists', 409)

  const hashed = await bcrypt.hash(password, 12)

  const user = await userRepo.createUserWithCart({
    email,
    password: hashed,
    firstName,
    lastName,
    phone,
  })

  sendTokenResponse(user, 201, res)
}

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await userRepo.findUserByEmail(email)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401)
  }
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 403)
  }

  sendTokenResponse(user, 200, res)
}

// GET /api/auth/me
export const getMe = async (req: Request, res: Response) => {
  const user = await userRepo.findPublicUserById(req.user!.id)
  res.json({ status: 'success', data: { user } })
}

// POST /api/auth/logout
export const logout = (req: Request, res: Response) => {
  res.clearCookie('token').json({
    status: 'success',
    message: 'Logged out successfully',
  })
}
