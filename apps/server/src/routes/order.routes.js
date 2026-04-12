import { Router } from 'express'
import {
  cancelOrder,
  createOrder,
  getMyOrders,
  getOrderById,
} from '../controllers/order.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(protect)

router.post('/', createOrder)
router.get('/', getMyOrders)
router.get('/:id', getOrderById)
router.patch('/:id/cancel', cancelOrder)

export default router
