import { Router } from 'express'
import {
  getCart,
  addItem,
  updateItem,
  clearCart,
  removeItem,
  mergeCart,
} from '../controllers/cart.controller.js'
import { protect } from '../middlewares/auth.middleware.js'
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

router.post('/items', validate({ body: addItemBodySchema }), addItem)

router.post('/merge', validate({ body: mergeCartBodySchema }), mergeCart)

router.patch(
  '/items/:productSizeId',
  validate({
    params: productSizeIdParamSchema,
    body: updateItemBodySchema,
  }),
  updateItem
)

router.delete(
  '/items/:productSizeId',
  validate({ params: productSizeIdParamSchema }),
  removeItem
)

router.delete('/', clearCart)

export default router
