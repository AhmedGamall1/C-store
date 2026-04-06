import { Router } from 'express'
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'

const router = Router()

// public routes
router.get('/', getAllCategories)
router.get('/:slug', getCategoryBySlug)

// admin only routes
router.post('/', protect, restrictTo('ADMIN'), createCategory)
router.patch('/:id', protect, restrictTo('ADMIN'), updateCategory)
router.delete('/:id', protect, restrictTo('ADMIN'), deleteCategory)

export default router
