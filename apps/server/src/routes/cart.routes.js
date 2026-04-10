import { Router } from 'express'
import { getCart, addItem } from '../controllers/cart.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

// All cart routes require authentication
router.use(protect)

router.get('/', getCart)
router.post('/items', addItem)

export default router
