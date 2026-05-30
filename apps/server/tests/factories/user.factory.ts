import bcrypt from 'bcrypt'
import prisma from '../../src/config/database.js'

let counter = 0

export const createUser = async (overrides = {}) => {
  counter += 1
  const password = overrides.password ?? 'password123'
  const hashedPassword = await bcrypt.hash(password, 4) // low cost = fast tests

  return prisma.user.create({
    data: {
      email: overrides.email ?? `user${counter}@test.local`,
      password: hashedPassword,
      firstName: overrides.firstName ?? 'Test',
      lastName: overrides.lastName ?? 'User',
      role: overrides.role ?? 'CUSTOMER',
      isActive: overrides.isActive ?? true,
      ...(overrides.phone && { phone: overrides.phone }),
    },
  })
}
