import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError.js'
import { env } from '../config/env.js'
import * as userRepo from '../repositories/user.repository.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const signToken = (id, role) =>
  jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d',
  })

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user.id, user.role)
  const { password: _pw, ...safeUser } = user
  res
    .status(statusCode)
    .cookie('token', token, COOKIE_OPTIONS)
    .json({ status: 'success', data: { user: safeUser } })
}

// POST /api/auth/register
export const register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body

  // check user exists with the same email
  const existing = await userRepo.findUserByEmail(email)
  if (existing) throw new AppError('User already exists', 409)

  // hash password before saving to DB
  const hashed = await bcrypt.hash(password, 12)

  // create user and cart atomically
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
export const login = async (req, res) => {
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
export const getMe = async (req, res) => {
  const user = await userRepo.findPublicUserById(req.user.id)
  res.json({ status: 'success', data: { user } })
}

// POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie('token').json({
    status: 'success',
    message: 'Logged out successfully',
  })
}
