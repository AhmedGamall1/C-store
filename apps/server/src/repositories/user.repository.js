import prisma from '../config/database.js'

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
}

export const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email } })

export const findUserById = (id) => prisma.user.findUnique({ where: { id } })

export const findPublicUserById = (id) =>
  prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_SELECT })

// create user, cart atomiclly
export const createUserWithCart = (data) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data })
    await tx.cart.create({ data: { userId: user.id } })
    return user
  })
