import { Router } from 'express'
import { paymobWebhook } from '../controllers/paymob.controller.js'
import { validate } from '../middlewares/validate.middleware.js'
import {
  paymobWebhookBodySchema,
  paymobWebhookQuerySchema,
} from '../schemas/paymob.schema.js'

const router = Router()

router.post(
  '/webhook',
  validate({
    query: paymobWebhookQuerySchema,
    body: paymobWebhookBodySchema,
  }),
  paymobWebhook
)

export default router
