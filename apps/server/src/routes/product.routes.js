import { Router } from 'express'
import {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'
import upload, { handleMulterError } from '../middlewares/upload.middlware.js'

const router = Router()

// product images middlware
const productUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 5 },
])

// public routes
router.get('/', getAllProducts)
router.get('/:slug', getProductBySlug)

// admin only routes
router.post(
  '/',
  protect,
  restrictTo('ADMIN'),
  productUpload,
  handleMulterError,
  createProduct
)
router.patch(
  '/:id',
  protect,
  restrictTo('ADMIN'),
  productUpload,
  handleMulterError,
  updateProduct
)

router.delete('/:id', protect, restrictTo('ADMIN'), deleteProduct)

export default router
