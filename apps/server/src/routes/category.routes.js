import { Router } from 'express'
import {
  getAllCategories,
  getAllCategoriesAdmin,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'
import upload, { handleMulterError } from '../middlewares/upload.middlware.js'

const router = Router()

// public routes
router.get('/', getAllCategories)

// admin routes (before /:slug so "admin" isn't treated as a slug)
router.get('/admin', protect, restrictTo('ADMIN'), getAllCategoriesAdmin)

router.get('/:slug', getCategoryBySlug)

// admin only routes
router.post(
  '/',
  protect,
  restrictTo('ADMIN'),
  upload.single('image'),
  handleMulterError,
  createCategory
)
router.patch(
  '/:id',
  protect,
  restrictTo('ADMIN'),
  upload.single('image'),
  handleMulterError,
  updateCategory
)
router.delete('/:id', protect, restrictTo('ADMIN'), deleteCategory)

export default router
