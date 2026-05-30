import type { Prisma } from '@prisma/client'
import AppError from '../utils/AppError.js'
import { deleteImage, uploadImage } from '../utils/cloudinary.util.js'
import slugify from '../utils/slugify.js'
import * as repo from '../repositories/category.repository.js'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../schemas/category.schema.js'

const CATEGORIES_FOLDER = 'c-store/categories'

export const getAllCategories = () => repo.findAllActive()

export const getAllCategoriesAdmin = () => repo.findAllForAdmin()

export const getCategoryBySlug = async (slug: string) => {
  const category = await repo.findBySlugWithProducts(slug)
  if (!category) throw new AppError('Category not found', 404)
  return category
}

export const createCategory = async (
  data: CreateCategoryInput,
  files: { imageBuffer: Buffer }
) => {
  const { name, description } = data
  const slug = slugify(name)

  const existing = await repo.findBySlug(slug)
  if (existing) {
    throw new AppError('Category with this name already exists', 409)
  }

  const { secure_url, public_id } = await uploadImage(
    files.imageBuffer,
    CATEGORIES_FOLDER
  )

  return repo.create({
    name,
    slug,
    description,
    imageUrl: secure_url,
    imagePublicId: public_id,
  })
}

export const updateCategory = async (
  id: string,
  data: UpdateCategoryInput,
  files: { imageBuffer?: Buffer } = {}
) => {
  const { imageBuffer } = files
  const category = await repo.findById(id)

  if (!category) {
    throw new AppError('Category not found', 404)
  }

  const updateData: Prisma.CategoryUpdateArgs['data'] = {}

  if (data.name !== undefined) {
    updateData.name = data.name
    updateData.slug = slugify(data.name)
  }

  if (data.description !== undefined) {
    updateData.description = data.description
  }

  if (data.imageUrl !== undefined) {
    updateData.imageUrl = data.imageUrl
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive
  }

  if (imageBuffer) {
    await deleteImage(category.imagePublicId)
    const { secure_url, public_id } = await uploadImage(
      imageBuffer,
      CATEGORIES_FOLDER
    )
    updateData.imageUrl = secure_url
    updateData.imagePublicId = public_id
  }

  return repo.updateById(id, updateData)
}

export const deleteCategory = async (id: string) => {
  const category = await repo.findByIdWithProductCount(id)

  if (!category) {
    throw new AppError('Category not found', 404)
  }

  if (category._count.products > 0) {
    throw new AppError(
      'Cannot delete category with existing products. Move or delete the products first.',
      400
    )
  }

  await repo.removeById(id)

  // Cleanup cloudinary AFTER the DB commit — if the DB fails, the image stays intact.
  await deleteImage(category.imagePublicId)
}
