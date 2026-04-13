import AppError from '../utils/AppError.js'
import crypto from 'crypto'
import prisma from '../config/database.js'

const PAYMOB_API_URL = 'https://accept.paymob.com/api'

const getAuthToken = async () => {
  const res = await fetch(`${PAYMOB_API_URL}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
  })

  const data = await res.json()

  if (!res.ok || !data.token) {
    throw new AppError('Paymob authentication failed', 502)
  }

  return data.token
}

const registerOrder = async (authToken, amountCents, internalOrderId) => {
  const res = await fetch(`${PAYMOB_API_URL}/ecommerce/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: 'EGP',
      merchant_order_id: internalOrderId,
      items: [],
    }),
  })

  const data = await res.json()

  if (!res.ok || !data.id) {
    throw new AppError('Failed to register order with Paymob', 502)
  }

  return data.id // Paymob's order ID
}

const getPaymentKey = async (
  authToken,
  paymobOrderId,
  amountCents,
  billingData
) => {
  const res = await fetch(`${PAYMOB_API_URL}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600, // seconds
      order_id: paymobOrderId,
      billing_data: {
        first_name: billingData.firstName,
        last_name: billingData.lastName,
        email: billingData.email,
        phone_number: billingData.phone || 'N/A',
        apartment: 'N/A',
        floor: 'N/A',
        street: billingData.street || 'N/A',
        building: 'N/A',
        shipping_method: 'PKG',
        postal_code: 'N/A',
        city: billingData.city || billingData.governorate,
        country: 'EG',
        state: billingData.governorate,
      },
      currency: 'EGP',
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
    }),
  })

  const data = await res.json()

  if (!res.ok || !data.token) {
    throw new AppError('Failed to generate Paymob payment key', 502)
  }

  return data.token // payment_key for the iframe
}

export const initiatePaymobPayment = async (order, user) => {
  // Paymob works in cents (EGP × 100), must be an integer
  const amountCents = Math.round(Number(order.total) * 100)

  // 1. Authenticate and get token
  const authToken = await getAuthToken()

  // 2. Register order with Paymob
  const paymobOrderId = await registerOrder(authToken, amountCents, order.id)

  // 3. Get payment key for the iframe
  const paymentKey = await getPaymentKey(
    authToken,
    paymobOrderId,
    amountCents,
    {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      street: order.address.street,
      city: order.address.city,
      governorate: order.address.governorate,
    }
  )

  const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`

  return { iframeUrl, paymobOrderId: String(paymobOrderId) }
}

export const verifyPaymobHmac = (body, receivedHmac) => {
  const { obj } = body

  const concatenated = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order?.id,
    obj.owner,
    obj.pending,
    obj.source_data?.pan,
    obj.source_data?.sub_type,
    obj.source_data?.type,
    obj.success,
  ].join('')

  const computed = crypto
    .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
    .update(concatenated)
    .digest('hex')

  return computed === receivedHmac
}

export const handleWebhookTransaction = async (body) => {
  const { obj } = body
  const paymobOrderId = String(obj.order?.id)

  const order = await prisma.order.findFirst({
    where: { paymobOrderId },
    include: { items: true },
  })

  // Unknown order or already in a terminal state — skip silently
  if (
    !order ||
    order.paymentStatus === 'PAID' ||
    order.status === 'CANCELLED'
  ) {
    return
  }

  // 3DS still in progress — Paymob will send another event when it settles
  if (obj.pending === true) return

  if (obj.success === true) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        reservedUntil: null,
      },
    })
  } else {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', reservedUntil: null },
      })
    })
  }
}
