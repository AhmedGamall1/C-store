import { Router } from 'express'
import {
  getAllProducts,
  getAllProductsAdmin,
  getProductByIdAdmin,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  forceDeleteProduct,
} from '../controllers/product.controller.js'
import * as variantController from '../controllers/variant.controller.js'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'
import upload, { handleMulterError } from '../middlewares/upload.middlware.js'

const router = Router()

// product / color image upload shape
const productUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 5 },
])

// public routes
router.get('/', getAllProducts)

// admin listing & detail (before /:slug)
router.get('/admin', protect, restrictTo('ADMIN'), getAllProductsAdmin)
router.get('/admin/:id', protect, restrictTo('ADMIN'), getProductByIdAdmin)

router.get('/:slug', getProductBySlug)

// ---------- admin: product CRUD ----------
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
router.delete('/:id/force', protect, restrictTo('ADMIN'), forceDeleteProduct)

// ---------- admin: colors ----------
router.post(
  '/:id/colors',
  protect,
  restrictTo('ADMIN'),
  productUpload,
  handleMulterError,
  variantController.addColor
)
router.patch(
  '/:id/colors/:colorId',
  protect,
  restrictTo('ADMIN'),
  productUpload,
  handleMulterError,
  variantController.updateColor
)
router.delete(
  '/:id/colors/:colorId',
  protect,
  restrictTo('ADMIN'),
  variantController.deleteColor
)

// ---------- admin: sizes (JSON only, no files) ----------
router.post(
  '/:id/colors/:colorId/sizes',
  protect,
  restrictTo('ADMIN'),
  variantController.addSize
)
router.patch(
  '/:id/colors/:colorId/sizes/:sizeId',
  protect,
  restrictTo('ADMIN'),
  variantController.updateSize
)
router.delete(
  '/:id/colors/:colorId/sizes/:sizeId',
  protect,
  restrictTo('ADMIN'),
  variantController.deleteSize
)

export default router
