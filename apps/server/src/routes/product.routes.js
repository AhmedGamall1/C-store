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
import { validate } from '../middlewares/validate.middleware.js'
import { requireFile } from '../middlewares/requireFile.middleware.js'
import {
  createProductBodySchema,
  updateProductBodySchema,
  listProductsPublicQuerySchema,
  listProductsAdminQuerySchema,
  idParamSchema,
  slugParamSchema,
} from '../schemas/product.schema.js'

const router = Router()

const productUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 5 },
])

// ----- public -----
router.get(
  '/',
  validate({ query: listProductsPublicQuerySchema }),
  getAllProducts
)

// admin listing & detail must come before /:slug
router.get(
  '/admin',
  protect,
  restrictTo('ADMIN'),
  validate({ query: listProductsAdminQuerySchema }),
  getAllProductsAdmin
)
router.get(
  '/admin/:id',
  protect,
  restrictTo('ADMIN'),
  validate({ params: idParamSchema }),
  getProductByIdAdmin
)

router.get('/:slug', validate({ params: slugParamSchema }), getProductBySlug)

// ----- admin product CRUD -----
router.post(
  '/',
  protect,
  restrictTo('ADMIN'),
  productUpload,
  handleMulterError,
  requireFile('image'),
  validate({ body: createProductBodySchema }),
  createProduct
)
router.patch(
  '/:id',
  protect,
  restrictTo('ADMIN'),
  productUpload,
  handleMulterError,
  validate({ params: idParamSchema, body: updateProductBodySchema }),
  updateProduct
)
router.delete(
  '/:id',
  protect,
  restrictTo('ADMIN'),
  validate({ params: idParamSchema }),
  deleteProduct
)
router.delete(
  '/:id/force',
  protect,
  restrictTo('ADMIN'),
  validate({ params: idParamSchema }),
  forceDeleteProduct
)

// ----- variants (Phase 6b will refactor these; routes unchanged for now) -----
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
