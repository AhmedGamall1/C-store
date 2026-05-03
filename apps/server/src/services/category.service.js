import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'
import { deleteImage, uploadImage } from '../utils/cloudinary.util.js'
import slugify from '../utils/slugify.js'

const CATEGORIES_FOLDER = 'c-store/categories'

// getAllCategories (public — active only)
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

// getAllCategoriesAdmin (admin — includes inactive)
export const getAllCategoriesAdmin = async () => {
  return prisma.category.findMany({
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
export const createCategory = async (data, files) => {
  const { name, description } = data
  const { imageBuffer } = files

  if (!name) {
    throw new AppError('Category name is required', 400)
  }
  if (!imageBuffer) {
    throw new AppError('Category image is required', 400)
  }

  const slug = slugify(name)

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    throw new AppError('Category with this name already exists', 409)
  }

  let imageUrl = data.imageUrl
  let imagePublicId = null
  const result = await uploadImage(imageBuffer, CATEGORIES_FOLDER)
  imageUrl = result.secure_url
  imagePublicId = result.public_id

  return prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim(),
      imageUrl,
      imagePublicId,
    },
  })
}

// Admin functions - updateCategory
export const updateCategory = async (id, data, files = {}) => {
  const { imageBuffer } = files
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

  if (imageBuffer) {
    await deleteImage(category.imagePublicId)
    const result = await uploadImage(imageBuffer, CATEGORIES_FOLDER)
    updateData.imageUrl = result.secure_url
    updateData.imagePublicId = result.public_id
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

  await prisma.category.delete({ where: { id } })

  // Cleanup cloudinary AFTER the DB commit — if DB fails, image stays intact.
  await deleteImage(category.imagePublicId)
}
