import prisma from '../config/database.js'

const productCardInclude = {
  category: { select: { id: true, name: true, slug: true } },
  colors: {
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, hex: true, imageUrl: true },
  },
}

const productDetailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  colors: {
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    include: {
      sizes: { where: { isActive: true }, orderBy: { createdAt: 'asc' } },
    },
  },
  reviews: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  },
  _count: { select: { reviews: true } },
}

const productAdminInclude = {
  category: { select: { id: true, name: true, slug: true } },
  colors: {
    orderBy: { createdAt: 'asc' },
    include: { sizes: { orderBy: { createdAt: 'asc' } } },
  },
}

const buyableWhere = {
  colors: {
    some: {
      isActive: true,
      sizes: { some: { isActive: true } },
    },
  },
}

// ---------- reads ----------
export const findById = (id) => prisma.product.findUnique({ where: { id } })

export const findByIdAdminDetail = (id) =>
  prisma.product.findUnique({ where: { id }, include: productAdminInclude })

export const findByIdWithVariantsForDelete = (id) =>
  prisma.product.findUnique({
    where: { id },
    include: { colors: { include: { sizes: { select: { id: true } } } } },
  })

export const findBySlug = (slug) =>
  prisma.product.findUnique({ where: { slug } })

export const findPublicBySlug = (slug) =>
  prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      category: { isActive: true },
      ...buyableWhere,
    },
    include: productDetailInclude,
  })

// Atomic list + count for both public and admin pagination.
export const findManyPublic = ({ where, skip, take, orderBy }) =>
  prisma.$transaction([
    prisma.product.findMany({
      where: {
        isActive: true,
        category: { isActive: true },
        ...buyableWhere,
        ...where,
      },
      skip,
      take,
      orderBy,
      include: productCardInclude,
    }),
    prisma.product.count({
      where: {
        isActive: true,
        category: { isActive: true },
        ...buyableWhere,
        ...where,
      },
    }),
  ])

export const findManyAdmin = ({ where, skip, take, orderBy }) =>
  prisma.$transaction([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: productCardInclude,
    }),
    prisma.product.count({ where }),
  ])

// ---------- writes ----------
export const create = (data, tx = prisma) =>
  tx.product.create({
    data,
    include: { category: { select: { id: true, name: true, slug: true } } },
  })

export const updateById = (id, data, tx = prisma) =>
  tx.product.update({
    where: { id },
    data,
    include: { category: { select: { id: true, name: true, slug: true } } },
  })

// Soft delete — keeps historical orders intact.
export const softDeleteById = (id, tx = prisma) =>
  tx.product.update({ where: { id }, data: { isActive: false } })

export const removeById = (id, tx = prisma) =>
  tx.product.delete({ where: { id } })

// Used by force-delete to clean up cart items + reviews atomically.
export const cleanupCartItemsBySizeIds = (sizeIds, tx = prisma) =>
  tx.cartItem.deleteMany({ where: { productSizeId: { in: sizeIds } } })

export const removeReviewsByProductId = (productId, tx = prisma) =>
  tx.review.deleteMany({ where: { productId } })

export const countOrderItemsBySizeIds = (sizeIds) =>
  prisma.orderItem.count({ where: { productSizeId: { in: sizeIds } } })
