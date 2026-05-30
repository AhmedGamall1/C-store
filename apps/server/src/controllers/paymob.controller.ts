import type { Request, Response } from 'express'
import {
  verifyPaymobHmac,
  handleWebhookTransaction,
} from '../services/paymob.service.js'
import AppError from '../utils/AppError.js'

export const paymobWebhook = async (req: Request, res: Response) => {
  if (!verifyPaymobHmac(req.body, req.query.hmac as string)) {
    throw new AppError('Invalid HMAC signature', 401)
  }

  await handleWebhookTransaction(req.body)
  res.status(200).json({ status: 'success' })
}
