import { Router } from 'express'
import {
  getCart,
  addItem,
  updateItem,
  clearCart,
  removeItem,
  mergeCart,
} from '../controllers/cart.controller.js'
import { protect, requireVerified } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import {
  addItemBodySchema,
  updateItemBodySchema,
  mergeCartBodySchema,
  productSizeIdParamSchema,
} from '../schemas/cart.schema.js'

const router = Router()

router.use(protect)

router.get('/', getCart)

router.post(
  '/items',
  requireVerified,
  validate({ body: addItemBodySchema }),
  addItem
)

router.post(
  '/merge',
  requireVerified,
  validate({ body: mergeCartBodySchema }),
  mergeCart
)

router.patch(
  '/items/:productSizeId',
  requireVerified,
  validate({
    params: productSizeIdParamSchema,
    body: updateItemBodySchema,
  }),
  updateItem
)

router.delete(
  '/items/:productSizeId',
  requireVerified,
  validate({ params: productSizeIdParamSchema }),
  removeItem
)

router.delete('/', requireVerified, clearCart)

export default router
