import { Router } from 'express'
import {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/address.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(protect)

router.post('/', createAddress)
router.get('/', getMyAddresses)
router.put('/:id', updateAddress)
router.delete('/:id', deleteAddress)
router.patch('/:id/default', setDefaultAddress)

export default router
