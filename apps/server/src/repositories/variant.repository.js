import prisma from '../config/database.js'

export const findProductSizeById = (id) =>
  prisma.productSize.findUnique({
    where: { id },
    include: {
      color: { include: { product: true } },
    },
  })

export const findProductSizesByIds = (ids) =>
  prisma.productSize.findMany({
    where: { id: { in: ids } },
    include: {
      color: { include: { product: { select: { isActive: true } } } },
    },
  })

// lookup: needs name + price for snapshots and totals.
export const findProductSizesForOrder = (ids) =>
  prisma.productSize.findMany({
    where: { id: { in: ids } },
    include: {
      color: {
        include: {
          product: {
            select: { id: true, name: true, price: true, isActive: true },
          },
        },
      },
    },
  })
