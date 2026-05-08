import { Router } from 'express'
import {
  getShippingRates,
  getShippingCostByGovernorate,
} from '../controllers/shipping.controller.js'
import { validate } from '../middlewares/validate.middleware.js'
import { governorateParamSchema } from '../schemas/shipping.schema.js'

const router = Router()

router.get('/', getShippingRates)

router.get(
  '/:governorate',
  validate({ params: governorateParamSchema }),
  getShippingCostByGovernorate
)

export default router
