import * as categoryService from '../services/category.service.js'

// GET /api/categories/
export const getAllCategories = async (req, res) => {
  const categories = await categoryService.getAllCategories()
  res.json({
    status: 'success',
    results: categories.length,
    data: { categories },
  })
}

// GET /api/categories/admin
export const getAllCategoriesAdmin = async (req, res) => {
  const categories = await categoryService.getAllCategoriesAdmin()
  res.json({
    status: 'success',
    results: categories.length,
    data: { categories },
  })
}

// GET /api/categories/:slug
export const getCategoryBySlug = async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug)
  res.json({
    status: 'success',
    data: { category },
  })
}

// POST /api/categories/
export const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.body, {
    imageBuffer: req.file?.buffer ?? null,
  })
  res.status(201).json({ status: 'success', data: { category } })
}

// PATCH /api/categories/:id
export const updateCategory = async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body,
    {
      imageBuffer: req.file?.buffer ?? null,
    }
  )
  res.json({ status: 'success', data: { category } })
}

// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  await categoryService.deleteCategory(req.params.id)
  res.status(204).send()
}
