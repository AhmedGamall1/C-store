import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'

export const createAddress = async (userId, data) => {
  const { street, city, governorate, isDefault = false } = data

  if (!street || !city || !governorate) {
    throw new AppError('street, city, and governorate are required', 400)
  }

  // If this is the first address, make it default automatically
  const count = await prisma.address.count({ where: { userId } })
  const shouldBeDefault = count === 0 ? true : isDefault

  // update existing addresses to default: false if this new one is default
  if (shouldBeDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    })
  }

  return prisma.address.create({
    data: { userId, street, city, governorate, isDefault: shouldBeDefault },
  })
}

export const getMyAddresses = async (userId) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  })
}
