import * as authService from '../services/auth.service.js'
import jwt, { type SignOptions } from 'jsonwebtoken'
import type { Request, Response, CookieOptions } from 'express'
import type { Role, User } from '@prisma/client'
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
  const user = await authService.register(req.body)
  sendTokenResponse(user, 201, res)
}

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const user = await authService.login(req.body)
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
