import AppError from '../utils/AppError.js'

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
