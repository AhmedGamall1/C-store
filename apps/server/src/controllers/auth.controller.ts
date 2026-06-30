import * as authService from '../services/auth.service.js'
import type { Request, Response } from 'express'
import type { User } from '@prisma/client'
import { env } from '../config/env.js'
import * as userRepo from '../repositories/user.repository.js'
import {
  signAccessToken,
  issueRefreshToken,
} from '../services/token.service.js'
import { revokeRefreshToken } from '../services/token.service.js'

const ACCESS_MAX_AGE = 15 * 60 * 1000 // 15 min
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days

const baseCookie = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
}

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie('accessToken', accessToken, {
    ...baseCookie,
    maxAge: ACCESS_MAX_AGE,
  })
  res.cookie('refreshToken', refreshToken, {
    ...baseCookie,
    maxAge: REFRESH_MAX_AGE,
    path: '/api/auth', // refresh cookie is only sent to auth routes
  })
}

const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken', { path: '/api/auth' })
}

const sendAuthResponse = async (
  user: User,
  statusCode: number,
  res: Response
) => {
  const accessToken = signAccessToken(user.id, user.role)
  const refreshToken = await issueRefreshToken(user.id)
  setAuthCookies(res, accessToken, refreshToken)
  const { password: _pw, ...safeUser } = user
  res.status(statusCode).json({ status: 'success', data: { user: safeUser } })
}

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  const user = await authService.register(req.body)
  await sendAuthResponse(user, 201, res)
}

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const user = await authService.login(req.body)
  await sendAuthResponse(user, 200, res)
}

// POST /api/auth/verify-email
export const verifyEmail = async (req: Request, res: Response) => {
  await authService.verifyEmail(req.body.token)
  res.json({ status: 'success', message: 'Email verified successfully' })
}

// POST /api/auth/resend-verification
export const resendVerification = async (req: Request, res: Response) => {
  await authService.resendVerification(req.user!)
  res.json({ status: 'success', message: 'Verification email sent' })
}

// GET /api/auth/me
export const getMe = async (req: Request, res: Response) => {
  const user = await userRepo.findPublicUserById(req.user!.id)
  res.json({ status: 'success', data: { user } })
}

// POST /api/auth/logout
export const logout = async (req: Request, res: Response) => {
  await revokeRefreshToken(req.cookies?.refreshToken)
  clearAuthCookies(res)
  res.json({ status: 'success', message: 'Logged out successfully' })
}

// POST /api/auth/forget-password
export const forgotPassword = async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email)
  res.json({
    status: 'success',
    message: 'If that email exists, a reset link has been sent.',
  })
}

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password)
  res.json({
    status: 'success',
    message: 'Password reset successfully. Please log in.',
  })
}

// POST /api/auth/refresh
export const refresh = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, user } = await authService.refresh(
      req.cookies?.refreshToken
    )
    setAuthCookies(res, accessToken, refreshToken)
    const { password: _pw, ...safeUser } = user
    res.json({ status: 'success', data: { user: safeUser } })
  } catch (err) {
    clearAuthCookies(res) // dead session -> remove the cookies
    throw err
  }
}
