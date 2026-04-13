import {
  verifyPaymobHmac,
  handleWebhookTransaction,
} from '../services/paymob.service.js'
import AppError from '../utils/AppError.js'

// POST /api/paymob/webhook
export const paymobWebhook = async (req, res) => {
  const hmac = req.query.hmac

  if (!hmac) {
    throw new AppError('Missing HMAC signature', 400)
  }

  if (!verifyPaymobHmac(req.body, hmac)) {
    throw new AppError('Invalid HMAC signature', 401)
  }

  await handleWebhookTransaction(req.body)

  res.status(200).json({ status: 'success' })
}
