import { Router } from 'express'
import { paymobWebhook } from '../controllers/paymob.controller.js'

const router = Router()

router.post('/webhook', paymobWebhook)

export default router
