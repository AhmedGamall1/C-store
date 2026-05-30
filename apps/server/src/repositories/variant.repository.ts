import { Prisma } from '@prisma/client'
import prisma from '../config/database.js'
import type { DbClient } from './transaction.js'

export const findProductSizeById = (id: string) =>
  prisma.productSize.findUnique({
    where: { id },
    include: { color: { include: { product: true } } },
  })

export const findProductSizesByIds = (ids: string[]) =>
  prisma.productSize.findMany({
    where: { id: { in: ids } },
    include: {
      color: { include: { product: { select: { isActive: true } } } },
    },
  })

export const findProductSizesForOrder = (ids: string[]) =>
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

// Public bulk lookup shape — needs slug + image too.
export const findProductSizesForBulk = (ids: string[]) =>
  prisma.productSize.findMany({
    where: { id: { in: ids } },
    include: {
      color: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              isActive: true,
            },
          },
        },
      },
    },
  })

// ---------- color reads ----------
export const findColorById = (id: string) =>
  prisma.productColor.findUnique({ where: { id } })

// Delete flow needs the size IDs to count order items / clear carts.
export const findColorByIdWithSizes = (id: string) =>
  prisma.productColor.findUnique({
    where: { id },
    include: { sizes: { select: { id: true } } },
  })

// Duplicate-name check on create / rename.
export const findColorByProductAndName = (productId: string, name: string) =>
  prisma.productColor.findUnique({
    where: { productId_name: { productId, name } },
  })

// "Is there at least one OTHER sellable color on this product?"
// Used by deleteColor to refuse deleting the last sellable color.
export const findOtherSellableColor = (productId: string, excludeColorId: string) =>
  prisma.productColor.findFirst({
    where: {
      productId,
      id: { not: excludeColorId },
      isActive: true,
      sizes: { some: { isActive: true } },
    },
    select: { id: true },
  })

// ---------- color writes ----------
export const createColor = (
  data: Prisma.ProductColorCreateArgs['data'],
  tx: DbClient = prisma
) => tx.productColor.create({ data, include: { sizes: true } })

export const updateColorById = (
  id: string,
  data: Prisma.ProductColorUpdateArgs['data'],
  tx: DbClient = prisma
) =>
  tx.productColor.update({
    where: { id },
    data,
    include: { sizes: true },
  })

export const removeColorById = (id: string, tx: DbClient = prisma) =>
  tx.productColor.delete({ where: { id } })

// ---------- size reads ----------
export const findSizeById = (id: string) =>
  prisma.productSize.findUnique({ where: { id } })

// deleteSize needs color + product state for the last-sellable guard.
export const findSizeWithContext = (id: string) =>
  prisma.productSize.findUnique({
    where: { id },
    include: {
      color: {
        select: {
          id: true,
          isActive: true,
          productId: true,
          product: { select: { id: true, isActive: true } },
        },
      },
    },
  })

// Duplicate-label check on create / rename.
export const findSizeByColorAndLabel = (colorId: string, size: string) =>
  prisma.productSize.findUnique({
    where: { colorId_size: { colorId, size } },
  })

export const findOtherActiveSizeInColor = (colorId: string, excludeSizeId: string) =>
  prisma.productSize.findFirst({
    where: { colorId, id: { not: excludeSizeId }, isActive: true },
    select: { id: true },
  })

// ---------- size writes ----------
export const createSize = (
  data: Prisma.ProductSizeCreateArgs['data'],
  tx: DbClient = prisma
) => tx.productSize.create({ data })

export const updateSizeById = (
  id: string,
  data: Prisma.ProductSizeUpdateArgs['data'],
  tx: DbClient = prisma
) => tx.productSize.update({ where: { id }, data })

export const removeSizeById = (id: string, tx: DbClient = prisma) =>
  tx.productSize.delete({ where: { id } })
