import { Router } from 'express'
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller.js'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(protect)

router.post('/', createOrder)
router.get('/', getMyOrders)

router.get('/admin', restrictTo('ADMIN'), getAllOrders)

router.get('/:id', getOrderById)
router.patch('/:id/cancel', cancelOrder)
router.patch('/:id/status', restrictTo('ADMIN'), updateOrderStatus)

export default router
