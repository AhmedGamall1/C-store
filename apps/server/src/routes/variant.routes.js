import { Router } from 'express'
import * as variantController from '../controllers/variant.controller.js'

const router = Router()

// GET /api/variants/bulk?ids=<csv>
// Public — used by guest cart on the client to render + validate
// the items it keeps in localStorage.
router.get('/bulk', variantController.getVariantsBulk)

export default router
