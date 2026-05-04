import prisma from '../config/database.js'

const WITH_PRODUCT_COUNT = {
  _count: { select: { products: true } },
}

const PUBLIC_PRODUCT_PROJECTION = {
  id: true,
  name: true,
  slug: true,
  price: true,
  comparePrice: true,
  imageUrl: true,
}

export const findAllActive = () =>
  prisma.category.findMany({
    where: { isActive: true },
    include: WITH_PRODUCT_COUNT,
    orderBy: { name: 'asc' },
  })

export const findAllForAdmin = () =>
  prisma.category.findMany({
    include: WITH_PRODUCT_COUNT,
    orderBy: { name: 'asc' },
  })

export const findBySlugWithProducts = (slug) =>
  prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        select: PUBLIC_PRODUCT_PROJECTION,
      },
    },
  })

export const findBySlug = (slug) =>
  prisma.category.findUnique({ where: { slug } })

export const findById = (id) => prisma.category.findUnique({ where: { id } })

export const findByIdWithProductCount = (id) =>
  prisma.category.findUnique({
    where: { id },
    include: WITH_PRODUCT_COUNT,
  })

export const create = (data) => prisma.category.create({ data })

export const updateById = (id, data) =>
  prisma.category.update({ where: { id }, data })

export const removeById = (id) => prisma.category.delete({ where: { id } })
