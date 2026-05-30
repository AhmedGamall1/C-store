import { Router } from 'express'
import {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/address.controller.js'
import { protect } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import {
  createAddressBodySchema,
  updateAddressBodySchema,
  idParamSchema,
} from '../schemas/address.schema.js'

const router = Router()

router.use(protect)

router.get('/', getMyAddresses)

router.post('/', validate({ body: createAddressBodySchema }), createAddress)

router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateAddressBodySchema }),
  updateAddress
)

router.delete('/:id', validate({ params: idParamSchema }), deleteAddress)

router.patch(
  '/:id/default',
  validate({ params: idParamSchema }),
  setDefaultAddress
)

export default router
