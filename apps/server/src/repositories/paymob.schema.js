import { z } from 'zod'

export const paymobWebhookQuerySchema = z.object({
  hmac: z.string().min(1, 'Missing HMAC signature'),
})

export const paymobWebhookBodySchema = z
  .object({
    obj: z.object({}).passthrough(),
  })
  .passthrough()
