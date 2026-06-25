import bcrypt from 'bcrypt'
import AppError from '../utils/AppError.js'
import * as userRepo from '../repositories/user.repository.js'
import {
  createEmailVerifyToken,
  consumeEmailVerifyToken,
  createPasswordResetToken,
  consumePasswordResetToken,
} from './verification.service.js'
import type { User } from '@prisma/client'
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from './email.service.js'
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js'

export const register = async (input: RegisterInput) => {
  const existing = await userRepo.findUserByEmail(input.email)
  if (existing) throw new AppError('User already exists', 409)

  const password = await bcrypt.hash(input.password, 12)
  const user = await userRepo.createUserWithCart({ ...input, password })

  // generate token + store hash of it into redis hash => user_id
  const rawToken = await createEmailVerifyToken(user.id)
  try {
    await sendVerificationEmail(user.email, rawToken)
  } catch (err) {
    console.error('Failed to send verification email:', err)
  }

  return user
}

export const login = async ({ email, password }: LoginInput) => {
  const user = await userRepo.findUserByEmail(email)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401)
  }
  if (!user.isActive)
    throw new AppError('Your account has been deactivated', 403)
  return user
}

export const verifyEmail = async (token: string) => {
  const userId = await consumeEmailVerifyToken(token)
  if (!userId) throw new AppError('Invalid or expired verification link', 400)
  await userRepo.markEmailVerified(userId)
}

export const resendVerification = async (user: User) => {
  if (user.emailVerified) throw new AppError('Email is already verified', 400)
  const rawToken = await createEmailVerifyToken(user.id)
  await sendVerificationEmail(user.email, rawToken)
}

export const forgotPassword = async (email: string) => {
  const user = await userRepo.findUserByEmail(email)
  if (user) {
    const rawToken = await createPasswordResetToken(user.id)
    try {
      await sendPasswordResetEmail(user.email, rawToken)
    } catch (err) {
      console.error('Failed to send reset email:', err)
    }
  }
}

export const resetPassword = async (token: string, newPassword: string) => {
  const userId = await consumePasswordResetToken(token)
  if (!userId) throw new AppError('Invalid or expired reset link', 400)
  const password = await bcrypt.hash(newPassword, 12)
  await userRepo.updatePassword(userId, password)
}
