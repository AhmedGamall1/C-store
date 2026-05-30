import type { Request, Response } from 'express'
import * as categoryService from '../services/category.service.js'

// GET /api/categories
export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories()
  res.json({
    status: 'success',
    results: categories.length,
    data: { categories },
  })
}

// GET /api/categories/admin
export const getAllCategoriesAdmin = async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategoriesAdmin()
  res.json({
    status: 'success',
    results: categories.length,
    data: { categories },
  })
}

// GET /api/categories/:slug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug as string)
  res.json({ status: 'success', data: { category } })
}

// POST /api/categories
export const createCategory = async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body, {
    imageBuffer: req.file!.buffer,
  })
  res.status(201).json({ status: 'success', data: { category } })
}

// PATCH /api/categories/:id
export const updateCategory = async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(
    req.params.id as string,
    req.body,
    { imageBuffer: req.file?.buffer }
  )
  res.json({ status: 'success', data: { category } })
}

// DELETE /api/categories/:id
export const deleteCategory = async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id as string)
  res.status(204).send()
}
