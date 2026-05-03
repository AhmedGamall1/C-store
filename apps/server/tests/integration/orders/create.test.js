import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import prisma from '../../../src/config/database.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createVariant } from '../../factories/product.factory.js'
import { createAddress } from '../../factories/address.factory.js'

// Globally mock the paymob service for this file only — we never want
// real network calls during tests. The mock returns a fake iframe URL
// that mirrors the production shape.
vi.mock('../../../src/services/paymob.service.js', () => ({
  initiatePaymobPayment: vi.fn(async () => ({
    iframeUrl: 'https://paymob.test/iframe/abc',
    paymobOrderId: 'PMB-TEST-123',
  })),
}))

describe('POST /api/orders — logged-in user, COD', () => {
  it('creates an order with snapshots and decrements stock', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)
    const v = await createVariant({ price: 100, stock: 5 })

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({
        addressId: addr.id,
        items: [{ productSizeId: v.size.id, quantity: 2 }],
      })

    expect(res.status).toBe(201)
    expect(res.body.data.order).toMatchObject({
      paymentMethod: 'COD',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      subtotal: '200', // Decimal serialized as string
      shippingCost: '30',
      total: '230',
    })

    // Snapshot fields persisted onto the order item
    expect(res.body.data.order.items[0]).toMatchObject({
      quantity: 2,
      price: '100',
      colorName: v.color.name,
      size: v.size.size,
    })

    // Stock decremented
    const after = await prisma.productSize.findUnique({
      where: { id: v.size.id },
    })
    expect(after.stock).toBe(3)
  })

  it('clears the matching cart items when clearCart=true', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)
    const v = await createVariant({ price: 100, stock: 5 })

    await prisma.cart.create({
      data: {
        userId: user.id,
        items: { create: { productSizeId: v.size.id, quantity: 1 } },
      },
    })

    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({
        addressId: addr.id,
        clearCart: true,
        items: [{ productSizeId: v.size.id, quantity: 1 }],
      })

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    })
    expect(cart.items).toEqual([])
  })

  // ---------- validation ----------
  it('returns 400 when items array is empty', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ addressId: addr.id, items: [] })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/at least one item/i)
  })

  it('returns 400 when addressId is missing for a logged-in user', async () => {
    const { cookie } = await loggedInUser()
    const v = await createVariant({ stock: 5 })

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ items: [{ productSizeId: v.size.id, quantity: 1 }] })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/addressId/)
  })

  it('returns 404 when the address belongs to another user', async () => {
    const { cookie } = await loggedInUser()
    const other = await loggedInUser()
    const otherAddr = await createAddress(other.user.id) // NOT mine
    const v = await createVariant({ stock: 5 })

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({
        addressId: otherAddr.id,
        items: [{ productSizeId: v.size.id, quantity: 1 }],
      })

    expect(res.status).toBe(404)
  })

  it('returns 400 for an unknown productSizeId', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({
        addressId: addr.id,
        items: [
          {
            productSizeId: '00000000-0000-0000-0000-000000000000',
            quantity: 1,
          },
        ],
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/not found/i)
  })

  it('returns 400 when quantity exceeds available stock', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)
    const v = await createVariant({ stock: 2 })

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({
        addressId: addr.id,
        items: [{ productSizeId: v.size.id, quantity: 5 }],
      })

    expect(res.status).toBe(400)
  })

  it('returns 400 when shipping is not available for the governorate', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id, { governorate: 'antarctica' })
    const v = await createVariant({ stock: 5 })

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({
        addressId: addr.id,
        items: [{ productSizeId: v.size.id, quantity: 1 }],
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/shipping is not available/i)
  })
})

describe('POST /api/orders — guest', () => {
  it('creates an order using inline shipping info', async () => {
    const v = await createVariant({ price: 50, stock: 5 })

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productSizeId: v.size.id, quantity: 1 }],
        guest: {
          name: 'Guest McGuest',
          phone: '01000000000',
          email: 'guest@example.com',
        },
        shippingAddress: {
          street: '12 Tahrir',
          city: 'Cairo',
          governorate: 'cairo',
        },
      })

    expect(res.status).toBe(201)
    expect(res.body.data.order).toMatchObject({
      userId: null,
      guestEmail: 'guest@example.com',
      guestName: 'Guest McGuest',
      shippingCity: 'Cairo',
      shippingGovernorate: 'cairo',
    })
  })

  it('returns 400 when guest contact info is missing', async () => {
    const v = await createVariant({ stock: 5 })

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productSizeId: v.size.id, quantity: 1 }],
        shippingAddress: {
          street: 'x',
          city: 'Cairo',
          governorate: 'cairo',
        },
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/guest contact info/i)
  })

  it('returns 400 when guest shipping address is incomplete', async () => {
    const v = await createVariant({ stock: 5 })

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productSizeId: v.size.id, quantity: 1 }],
        guest: { name: 'G', phone: '01000000000' },
        shippingAddress: { street: 'x', city: 'Cairo' }, // missing governorate
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/shipping address/i)
  })
})

describe('POST /api/orders — PAYMOB path (mocked)', () => {
  it('returns the iframeUrl from initiatePaymobPayment and saves paymobOrderId', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)
    const v = await createVariant({ price: 100, stock: 5 })

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({
        addressId: addr.id,
        paymentMethod: 'PAYMOB',
        items: [{ productSizeId: v.size.id, quantity: 1 }],
      })

    expect(res.status).toBe(201)
    expect(res.body.data.iframeUrl).toBe('https://paymob.test/iframe/abc')
    expect(res.body.data.order.paymobOrderId).toBe('PMB-TEST-123')

    // reservedUntil should be set ~30 minutes in the future
    const stored = await prisma.order.findUnique({
      where: { id: res.body.data.order.id },
    })
    expect(stored.reservedUntil).not.toBeNull()
    expect(stored.paymobOrderId).toBe('PMB-TEST-123')
  })
})
