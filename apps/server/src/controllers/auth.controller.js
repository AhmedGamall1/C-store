import prisma from '../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError.js'

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user.id, user.role)
  const { password: _, ...userWithoutPassword } = user

  // cookie options
  const cookieOptions = {
    httpOnly: true, // JS cannot read this cookie
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict', // blocks CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  }

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      status: 'success',
      data: { user: userWithoutPassword },
    })
}

// POST /api/auth/register
export const register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body

  // validate required fields
  if (!email || !password || !firstName || !lastName) {
    throw new AppError('Please provide the required fields', 400)
  }

  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new AppError('User already exists', 409)
  }

  // validate password length
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400)
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
    },
  })

  // create empty cart for user
  await prisma.cart.create({
    data: { userId: user.id },
  })

  sendTokenResponse(user, 201, res)
}

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body

  // validate required fields
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400)
  }

  // find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  // check user exists and password is correct
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401)
  }

  // check if account is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 403)
  }

  // send token
  sendTokenResponse(user, 200, res)
}

// GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  })

  res.json({
    status: 'success',
    data: { user },
  })
}

// POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie('token').json({
    status: 'success',
    message: 'Logged out successfully',
  })
}
