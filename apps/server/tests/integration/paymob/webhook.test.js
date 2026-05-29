import { describe, it, expect } from 'vitest'
import request from 'supertest'
import crypto from 'crypto'
import app from '../../../src/app.js'
import prisma from '../../../src/config/database.js'
import { env } from '../../../src/config/env.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createAddress } from '../../factories/address.factory.js'
import { createVariant } from '../../factories/product.factory.js'

const buildObj = (overrides = {}) => ({
  amount_cents: 10000,
  created_at: '2026-01-01T00:00:00Z',
  currency: 'EGP',
  error_occured: false,
  has_parent_transaction: false,
  id: 1,
  integration_id: 1,
  is_3d_secure: false,
  is_auth: false,
  is_capture: false,
  is_refunded: false,
  is_standalone_payment: false,
  is_voided: false,
  order: { id: 'PMB-1' },
  owner: 1,
  pending: false,
  source_data: { pan: '1234', sub_type: 'visa', type: 'card' },
  success: true,
  ...overrides,
})

const signHmac = (obj) =>
  crypto
    .createHmac('sha512', env.PAYMOB_HMAC_SECRET)
    .update(
      [
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
    )
    .digest('hex')

const seedPaymobOrder = async () => {
  const { user } = await loggedInUser()
  const addr = await createAddress(user.id)
  const v = await createVariant({ price: 100, stock: 5 })

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      addressId: addr.id,
      paymentMethod: 'PAYMOB',
      paymentStatus: 'UNPAID',
      status: 'PENDING',
      subtotal: 100,
      shippingCost: 0,
      total: 100,
      paymobOrderId: 'PMB-1',
      items: {
        create: [
          {
            productSizeId: v.size.id,
            quantity: 1,
            price: 100,
            size: v.size.size,
            colorName: v.color.name,
          },
        ],
      },
    },
    include: { items: true },
  })

  return { order, sizeId: v.size.id }
}

describe('POST /api/paymob/webhook', () => {
  it('returns 400 when the hmac query is missing', async () => {
    const res = await request(app)
      .post('/api/paymob/webhook')
      .send({ obj: buildObj() })

    expect(res.status).toBe(400)
    expect(res.body.errors.some((e) => e.path === 'hmac')).toBe(true)
  })

  it('returns 401 when the hmac signature does not match', async () => {
    const res = await request(app)
      .post('/api/paymob/webhook?hmac=garbage')
      .send({ obj: buildObj() })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/invalid hmac/i)
  })

  it('marks the order PAID + CONFIRMED on a valid success event', async () => {
    const { order } = await seedPaymobOrder()
    const obj = buildObj({ order: { id: 'PMB-1' }, success: true })
    const hmac = signHmac(obj)

    const res = await request(app)
      .post(`/api/paymob/webhook?hmac=${hmac}`)
      .send({ obj })

    expect(res.status).toBe(200)

    const stored = await prisma.order.findUnique({ where: { id: order.id } })
    expect(stored.paymentStatus).toBe('PAID')
    expect(stored.status).toBe('CONFIRMED')
    expect(stored.reservedUntil).toBeNull()
  })

  it('cancels the order and restores stock on a valid failure event', async () => {
    const { order, sizeId } = await seedPaymobOrder()
    const stockBefore = (
      await prisma.productSize.findUnique({ where: { id: sizeId } })
    ).stock

    const obj = buildObj({ order: { id: 'PMB-1' }, success: false })
    const hmac = signHmac(obj)

    const res = await request(app)
      .post(`/api/paymob/webhook?hmac=${hmac}`)
      .send({ obj })

    expect(res.status).toBe(200)

    const stored = await prisma.order.findUnique({ where: { id: order.id } })
    expect(stored.status).toBe('CANCELLED')
    expect(stored.reservedUntil).toBeNull()

    const sizeAfter = await prisma.productSize.findUnique({
      where: { id: sizeId },
    })
    expect(sizeAfter.stock).toBe(stockBefore + 1)
  })
})
