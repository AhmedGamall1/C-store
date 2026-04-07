import { Router } from 'express'
import {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'

const router = Router()

// public routes
router.get('/', getAllProducts)
router.get('/:slug', getProductBySlug)

// admin only routes
router.post('/', protect, restrictTo('ADMIN'), createProduct)
router.patch('/:id', protect, restrictTo('ADMIN'), updateProduct)
router.delete('/:id', protect, restrictTo('ADMIN'), deleteProduct)

export default router
