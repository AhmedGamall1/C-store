import AppError from '../utils/AppError.js'
import { deleteImage, uploadImage } from '../utils/cloudinary.util.js'
import slugify from '../utils/slugify.js'
import * as repo from '../repositories/category.repository.js'

const CATEGORIES_FOLDER = 'c-store/categories'

// getAllCategories (public — active only)
export const getAllCategories = () => repo.findAllActive()

// getAllCategoriesAdmin (admin — includes inactive)
export const getAllCategoriesAdmin = () => repo.findAllForAdmin()

// getCategoryBySlug
export const getCategoryBySlug = async (slug) => {
  const category = await repo.findBySlugWithProducts(slug)
  if (!category) throw new AppError('Category not found', 404)
  return category
}

// Admin functions - createCategory
export const createCategory = async (data, files) => {
  const { name, description } = data
  const { imageBuffer } = files

  const slug = slugify(name)

  const existing = await repo.findBySlug(slug)
  if (existing) {
    throw new AppError('Category with this name already exists', 409)
  }

  const { secure_url, public_id } = await uploadImage(
    imageBuffer,
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

// Admin functions - updateCategory
export const updateCategory = async (id, data, files = {}) => {
  const { imageBuffer } = files
  const category = await repo.findById(id)

  if (!category) {
    throw new AppError('Category not found', 404)
  }

  const updateData = {}

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

// Admin functions - deleteCategory
export const deleteCategory = async (id) => {
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

  // Cleanup cloudinary AFTER the DB commit — if DB fails, image stays intact.
  await deleteImage(category.imagePublicId)
}
