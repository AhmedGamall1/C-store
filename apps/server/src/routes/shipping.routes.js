import { Router } from 'express'
import {
  getShippingRates,
  getShippingCostByGovernorate,
} from '../controllers/shipping.controller.js'

const router = Router()

router.get('/', getShippingRates)
router.get('/:governorate', getShippingCostByGovernorate)

export default router
