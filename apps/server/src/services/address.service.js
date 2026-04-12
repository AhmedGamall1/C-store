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

export const updateAddress = async (userId, addressId, data) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } })
  if (!address || address.userId !== userId)
    throw new AppError('Address not found', 404)

  const { isDefault, ...rest } = data

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    })
  }

  return prisma.address.update({
    where: { id: addressId },
    data: { ...rest, ...(isDefault !== undefined ? { isDefault } : {}) },
  })
}

export const deleteAddress = async (userId, addressId) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } })
  if (!address || address.userId !== userId)
    throw new AppError('Address not found', 404)

  await prisma.address.delete({ where: { id: addressId } })

  // If the deleted address was default, promote the oldest remaining address
  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { id: 'asc' },
    })
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      })
    }
  }
}

export const setDefaultAddress = async (userId, addressId) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } })
  if (!address || address.userId !== userId)
    throw new AppError('Address not found', 404)

  await prisma.address.updateMany({
    where: { userId },
    data: { isDefault: false },
  })
  return prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  })
}
