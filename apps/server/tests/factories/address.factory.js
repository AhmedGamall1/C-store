import prisma from '../../src/config/database.js'

let counter = 0

// Default governorate = 'cairo' so getShippingCost() returns 30
export const createAddress = async (userId, overrides = {}) => {
  counter += 1
  return prisma.address.create({
    data: {
      userId,
      street: overrides.street ?? `${counter} Test Street`,
      city: overrides.city ?? 'Cairo',
      governorate: overrides.governorate ?? 'cairo',
      isDefault: overrides.isDefault ?? true,
    },
  })
}
