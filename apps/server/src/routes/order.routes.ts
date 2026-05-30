import { Router, type RequestHandler } from 'express'
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getOrderByIdAdmin,
  updateOrderStatus,
} from '../controllers/order.controller.js'
import {
  optionalAuth,
  protect,
  restrictTo,
} from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import {
  createOrderUserBodySchema,
  createOrderGuestBodySchema,
  updateOrderStatusBodySchema,
  listOrdersAdminQuerySchema,
  idParamSchema,
} from '../schemas/order.schema.js'

const router = Router()

// Logged-in users and guests post different shapes, so pick the schema per request.
const validateCreateOrder: RequestHandler = (req, res, next) => {
  const schema = req.user
    ? createOrderUserBodySchema
    : createOrderGuestBodySchema
  return validate({ body: schema })(req, res, next)
}

router.post('/', optionalAuth, validateCreateOrder, createOrder)

router.use(protect)

router.get('/', getMyOrders)

router.get(
  '/admin',
  restrictTo('ADMIN'),
  validate({ query: listOrdersAdminQuerySchema }),
  getAllOrders
)
router.get(
  '/admin/:id',
  restrictTo('ADMIN'),
  validate({ params: idParamSchema }),
  getOrderByIdAdmin
)

router.get('/:id', validate({ params: idParamSchema }), getOrderById)

router.patch('/:id/cancel', validate({ params: idParamSchema }), cancelOrder)
router.patch(
  '/:id/status',
  restrictTo('ADMIN'),
  validate({ params: idParamSchema, body: updateOrderStatusBodySchema }),
  updateOrderStatus
)

export default router
