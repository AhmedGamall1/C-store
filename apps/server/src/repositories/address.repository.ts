import { Prisma } from '@prisma/client'
import prisma from '../config/database.js'
import type { DbClient } from './transaction.js'

export const countForUser = (userId: string) =>
  prisma.address.count({ where: { userId } })

export const findAllForUser = (userId: string) =>
  prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  })

export const findByIdForUser = (id: string, userId: string) =>
  prisma.address.findFirst({ where: { id, userId } })

export const findOldestForUser = (userId: string, tx: DbClient = prisma) =>
  tx.address.findFirst({ where: { userId }, orderBy: { id: 'asc' } })

export const create = (
  data: Prisma.AddressCreateArgs['data'],
  tx: DbClient = prisma
) => tx.address.create({ data })

export const updateById = (
  id: string,
  data: Prisma.AddressUpdateArgs['data'],
  tx: DbClient = prisma
) => tx.address.update({ where: { id }, data })

export const removeById = (id: string, tx: DbClient = prisma) =>
  tx.address.delete({ where: { id } })

export const clearDefaultsForUser = (userId: string, tx: DbClient = prisma) =>
  tx.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  })
