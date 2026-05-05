import prisma from '../config/database.js'

export const countForUser = (userId) =>
  prisma.address.count({ where: { userId } })

export const findAllForUser = (userId) =>
  prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  })

export const findByIdForUser = (id, userId) =>
  prisma.address.findFirst({ where: { id, userId } })

export const findOldestForUser = (userId, tx = prisma) =>
  tx.address.findFirst({ where: { userId }, orderBy: { id: 'asc' } })

export const create = (data, tx = prisma) => tx.address.create({ data })

export const updateById = (id, data, tx = prisma) =>
  tx.address.update({ where: { id }, data })

export const removeById = (id, tx = prisma) =>
  tx.address.delete({ where: { id } })

export const clearDefaultsForUser = (userId, tx = prisma) =>
  tx.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  })
