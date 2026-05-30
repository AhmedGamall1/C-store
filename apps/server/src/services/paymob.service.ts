import crypto from 'crypto'
import type { User } from '@prisma/client'
import AppError from '../utils/AppError.js'
import { env } from '../config/env.js'
import { withTransaction } from '../repositories/transaction.js'
import * as orderRepo from '../repositories/order.repository.js'

const PAYMOB_API_URL = 'https://accept.paymob.com/api'

type OrderForPayment = NonNullable<
  Awaited<ReturnType<typeof orderRepo.findByIdWithOrderInclude>>
>

interface BillingData {
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  street?: string | null
  city?: string | null
  governorate?: string | null
}

// Paymob sends a large flat payload; we only read a handful of fields by name.
interface PaymobWebhookBody {
  obj: {
    order?: { id?: number | string }
    source_data?: Record<string, unknown>
    pending?: boolean
    success?: boolean
    [key: string]: unknown
  }
}

const getAuthToken = async (): Promise<string> => {
  const res = await fetch(`${PAYMOB_API_URL}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: env.PAYMOB_API_KEY }),
  })

  const data = (await res.json()) as { token?: string }
  if (!res.ok || !data.token) {
    throw new AppError('Paymob authentication failed', 502)
  }
  return data.token
}

const registerOrder = async (
  authToken: string,
  amountCents: number,
  internalOrderId: string
): Promise<number> => {
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

  const data = (await res.json()) as { id?: number }
  if (!res.ok || !data.id) {
    throw new AppError('Failed to register order with Paymob', 502)
  }
  return data.id
}

const getPaymentKey = async (
  authToken: string,
  paymobOrderId: number,
  amountCents: number,
  billing: BillingData
): Promise<string> => {
  const res = await fetch(`${PAYMOB_API_URL}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: {
        first_name: billing.firstName,
        last_name: billing.lastName,
        email: billing.email,
        phone_number: billing.phone || 'N/A',
        apartment: 'N/A',
        floor: 'N/A',
        street: billing.street || 'N/A',
        building: 'N/A',
        shipping_method: 'PKG',
        postal_code: 'N/A',
        city: billing.city || billing.governorate,
        country: 'EG',
        state: billing.governorate,
      },
      currency: 'EGP',
      integration_id: Number(env.PAYMOB_INTEGRATION_ID),
    }),
  })

  const data = (await res.json()) as { token?: string }
  if (!res.ok || !data.token) {
    throw new AppError('Failed to generate Paymob payment key', 502)
  }
  return data.token
}

const buildBillingData = (
  order: OrderForPayment,
  user: User | null | undefined
): BillingData => {
  if (user) {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      street: order.address?.street,
      city: order.address?.city,
      governorate: order.address?.governorate,
    }
  }

  const nameParts = (order.guestName ?? '').trim().split(/\s+/)
  return {
    firstName: nameParts[0] || 'Guest',
    lastName: nameParts.slice(1).join(' ') || 'Customer',
    email: order.guestEmail,
    phone: order.guestPhone,
    street: order.shippingStreet,
    city: order.shippingCity,
    governorate: order.shippingGovernorate,
  }
}

export const initiatePaymobPayment = async (
  order: OrderForPayment,
  user: User | null | undefined
) => {
  // Paymob works in cents (EGP × 100) and needs an integer.
  const amountCents = Math.round(Number(order.total) * 100)

  const authToken = await getAuthToken()
  const paymobOrderId = await registerOrder(authToken, amountCents, order.id)
  const paymentKey = await getPaymentKey(
    authToken,
    paymobOrderId,
    amountCents,
    buildBillingData(order, user)
  )

  const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`

  return { iframeUrl, paymobOrderId: String(paymobOrderId) }
}

export const verifyPaymobHmac = (
  body: PaymobWebhookBody,
  receivedHmac: string
): boolean => {
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
    .createHmac('sha512', env.PAYMOB_HMAC_SECRET)
    .update(concatenated)
    .digest('hex')

  return computed === receivedHmac
}

export const handleWebhookTransaction = async (body: PaymobWebhookBody) => {
  const { obj } = body
  const paymobOrderId = String(obj.order?.id)

  const order = await orderRepo.findByPaymobOrderId(paymobOrderId)

  if (!order || order.paymentStatus === 'PAID' || order.status === 'CANCELLED') {
    return
  }
  // 3DS still in progress — Paymob sends another event when it settles.
  if (obj.pending === true) return

  if (obj.success === true) {
    await orderRepo.updateOrder(order.id, {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      reservedUntil: null,
    })
    return
  }

  await withTransaction(async (tx) => {
    for (const item of order.items) {
      if (item.productSizeId) {
        await orderRepo.incrementSizeStock(item.productSizeId, item.quantity, tx)
      }
    }
    await orderRepo.updateOrder(
      order.id,
      { status: 'CANCELLED', reservedUntil: null },
      tx
    )
  })
}
