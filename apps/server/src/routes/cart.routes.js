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

const router = Router()

// All cart routes require authentication
router.use(protect)

router.get('/', getCart)
router.post('/items', addItem)
router.post('/merge', mergeCart)
router.patch('/items/:productSizeId', updateItem)
router.delete('/items/:productSizeId', removeItem)
router.delete('/', clearCart)

export default router
