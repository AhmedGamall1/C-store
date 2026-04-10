import { Router } from 'express'
import {
  getCart,
  addItem,
  updateItem,
  clearCart,
  removeItem,
} from '../controllers/cart.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

// All cart routes require authentication
router.use(protect)

router.get('/', getCart)
router.post('/items', addItem)
router.patch('/items/:productId', updateItem)
router.delete('/items/:productId', removeItem)
router.delete('/', clearCart)

export default router
