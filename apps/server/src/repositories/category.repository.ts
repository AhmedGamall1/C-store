import { Prisma } from '@prisma/client'
import prisma from '../config/database.js'

const WITH_PRODUCT_COUNT = {
  _count: { select: { products: true } },
} satisfies Prisma.CategoryInclude

const PUBLIC_PRODUCT_PROJECTION = {
  id: true,
  name: true,
  slug: true,
  price: true,
  comparePrice: true,
  imageUrl: true,
} satisfies Prisma.ProductSelect

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

export const findBySlugWithProducts = (slug: string) =>
  prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        select: PUBLIC_PRODUCT_PROJECTION,
      },
    },
  })

export const findBySlug = (slug: string) =>
  prisma.category.findUnique({ where: { slug } })

export const findById = (id: string) =>
  prisma.category.findUnique({ where: { id } })

export const findByIdWithProductCount = (id: string) =>
  prisma.category.findUnique({
    where: { id },
    include: WITH_PRODUCT_COUNT,
  })

export const create = (data: Prisma.CategoryCreateArgs['data']) =>
  prisma.category.create({ data })

export const updateById = (id: string, data: Prisma.CategoryUpdateArgs['data']) =>
  prisma.category.update({ where: { id }, data })

export const removeById = (id: string) =>
  prisma.category.delete({ where: { id } })
