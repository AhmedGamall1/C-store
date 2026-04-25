import { Router } from 'express'
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

const router = Router()

// Create order — works for both logged-in users and guests
router.post('/', optionalAuth, createOrder)

router.use(protect)

router.get('/', getMyOrders)

router.get('/admin', restrictTo('ADMIN'), getAllOrders)
router.get('/admin/:id', restrictTo('ADMIN'), getOrderByIdAdmin)

router.get('/:id', getOrderById)
router.patch('/:id/cancel', cancelOrder)
router.patch('/:id/status', restrictTo('ADMIN'), updateOrderStatus)

export default router
