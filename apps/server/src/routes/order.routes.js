import { Router } from 'express'
import { createOrder } from '../controllers/order.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(protect)

router.post('/', createOrder)

export default router
