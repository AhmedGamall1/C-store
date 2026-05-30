import { Router } from 'express'
import * as variantController from '../controllers/variant.controller.js'
import { validate } from '../middlewares/validate.middleware.js'
import { variantsBulkQuerySchema } from '../schemas/variant.schema.js'

const router = Router()

// GET /api/variants/bulk?ids=<csv>
// Public — used by the guest cart on the client to render + validate
// the items it keeps in localStorage.
router.get(
  '/bulk',
  validate({ query: variantsBulkQuerySchema }),
  variantController.getVariantsBulk
)

export default router
