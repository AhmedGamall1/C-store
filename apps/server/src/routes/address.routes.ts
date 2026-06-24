import { Router } from 'express'
import {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/address.controller.js'
import { protect, requireVerified } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import {
  createAddressBodySchema,
  updateAddressBodySchema,
  idParamSchema,
} from '../schemas/address.schema.js'

const router = Router()

router.use(protect)

router.get('/', getMyAddresses)

router.post(
  '/',
  requireVerified,
  validate({ body: createAddressBodySchema }),
  createAddress
)

router.put(
  '/:id',
  requireVerified,
  validate({ params: idParamSchema, body: updateAddressBodySchema }),
  updateAddress
)

router.delete(
  '/:id',
  requireVerified,
  validate({ params: idParamSchema }),
  deleteAddress
)

router.patch(
  '/:id/default',
  requireVerified,
  validate({ params: idParamSchema }),
  setDefaultAddress
)

export default router
