import { Router } from 'express'
import {
  createAddress,
  getMyAddresses,
} from '../controllers/address.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(protect)

router.post('/', createAddress)
router.get('/', getMyAddresses)

export default router
