import prisma from '../config/database.js'

export const findProductSizeById = (id) =>
  prisma.productSize.findUnique({
    where: { id },
    include: { color: { include: { product: true } } },
  })

export const findProductSizesByIds = (ids) =>
  prisma.productSize.findMany({
    where: { id: { in: ids } },
    include: {
      color: { include: { product: { select: { isActive: true } } } },
    },
  })

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

// Public bulk lookup shape — needs slug + image too.
export const findProductSizesForBulk = (ids) =>
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
export const findColorById = (id) =>
  prisma.productColor.findUnique({ where: { id } })

// Used by delete — we need the size IDs to count order items / clear carts.
export const findColorByIdWithSizes = (id) =>
  prisma.productColor.findUnique({
    where: { id },
    include: { sizes: { select: { id: true } } },
  })

// Duplicate-name check on create / rename.
export const findColorByProductAndName = (productId, name) =>
  prisma.productColor.findUnique({
    where: { productId_name: { productId, name } },
  })

// "Is there at least one OTHER color on this product that is sellable?"
// Used by deleteColor to refuse deleting the last sellable color.
export const findOtherSellableColor = (productId, excludeColorId) =>
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
export const createColor = (data, tx = prisma) =>
  tx.productColor.create({ data, include: { sizes: true } })

export const updateColorById = (id, data, tx = prisma) =>
  tx.productColor.update({
    where: { id },
    data,
    include: { sizes: true },
  })

export const removeColorById = (id, tx = prisma) =>
  tx.productColor.delete({ where: { id } })

// ---------- size reads ----------
export const findSizeById = (id) =>
  prisma.productSize.findUnique({ where: { id } })

// Used by deleteSize — we need color + product state for the last-sellable guard.
export const findSizeWithContext = (id) =>
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
export const findSizeByColorAndLabel = (colorId, size) =>
  prisma.productSize.findUnique({
    where: { colorId_size: { colorId, size } },
  })

export const findOtherActiveSizeInColor = (colorId, excludeSizeId) =>
  prisma.productSize.findFirst({
    where: { colorId, id: { not: excludeSizeId }, isActive: true },
    select: { id: true },
  })

// ---------- size writes ----------
export const createSize = (data, tx = prisma) => tx.productSize.create({ data })

export const updateSizeById = (id, data, tx = prisma) =>
  tx.productSize.update({ where: { id }, data })

export const removeSizeById = (id, tx = prisma) =>
  tx.productSize.delete({ where: { id } })
