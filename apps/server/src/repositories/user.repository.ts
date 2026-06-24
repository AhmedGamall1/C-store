import { Prisma } from '@prisma/client'
import prisma from '../config/database.js'

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
} satisfies Prisma.UserSelect

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } })

export const findUserById = (id: string) =>
  prisma.user.findUnique({ where: { id } })

export const findPublicUserById = (id: string) =>
  prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_SELECT })

// Create the user and their (empty) cart together, atomically.
export const createUserWithCart = (data: Prisma.UserCreateArgs['data']) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data })
    await tx.cart.create({ data: { userId: user.id } })
    return user
  })

export const markEmailVerified = (id: string) =>
  prisma.user.update({ where: { id }, data: { emailVerified: true } })
