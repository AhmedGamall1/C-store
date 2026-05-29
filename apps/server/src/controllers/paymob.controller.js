import {
  verifyPaymobHmac,
  handleWebhookTransaction,
} from '../services/paymob.service.js'
import AppError from '../utils/AppError.js'

export const paymobWebhook = async (req, res) => {
  if (!verifyPaymobHmac(req.body, req.query.hmac)) {
    throw new AppError('Invalid HMAC signature', 401)
  }

  await handleWebhookTransaction(req.body)
  res.status(200).json({ status: 'success' })
}
