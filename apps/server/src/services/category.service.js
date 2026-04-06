import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'
import slugify from '../utils/slugify.js'

// getAllCategories
export const getAllCategories = async () => {
  return prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

// getCategoryBySlug
export const getCategoryBySlug = async (slug) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          comparePrice: true,
          imageUrl: true,
          stock: true,
        },
      },
    },
  })

  if (!category) {
    throw new AppError('Category not found', 404)
  }

  return category
}

// Admin functions - createCategory
export const createCategory = async (data) => {
  const { name, description, imageUrl } = data

  if (!name) {
    throw new AppError('Category name is required', 400)
  }

  const slug = slugify(name)

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    throw new AppError('Category with this name already exists', 409)
  }

  return prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim(),
      imageUrl,
    },
  })
}

// Admin functions - updateCategory
export const updateCategory = async (id, data) => {
  const category = await prisma.category.findUnique({ where: { id } })

  if (!category) {
    throw new AppError('Category not found', 404)
  }

  const updateData = {}

  if (data.name) {
    updateData.name = data.name.trim()
    updateData.slug = slugify(data.name)
  }

  if (data.description !== undefined) {
    updateData.description = data.description?.trim()
  }

  if (data.imageUrl !== undefined) {
    updateData.imageUrl = data.imageUrl
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive
  }

  return prisma.category.update({
    where: { id },
    data: updateData,
  })
}

// Admin functions - deleteCategory
export const deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
    },
  })

  if (!category) {
    throw new AppError('Category not found', 404)
  }

  if (category._count.products > 0) {
    throw new AppError(
      'Cannot delete category with existing products. Move or delete the products first.',
      400
    )
  }

  return prisma.category.delete({ where: { id } })
}
