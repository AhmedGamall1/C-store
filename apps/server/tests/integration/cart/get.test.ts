import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import prisma from '../../../src/config/database.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createVariant } from '../../factories/product.factory.js'

describe('GET /api/cart', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/cart')
    expect(res.status).toBe(401)
  })

  it('returns an empty cart for a brand-new user', async () => {
    const { cookie } = await loggedInUser()
    const res = await request(app).get('/api/cart').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.data.cart).toMatchObject({
      items: [],
      total: 0,
      totalItems: 0,
    })
  })

  it('returns items with computed unitPrice and subtotal', async () => {
    const { user, cookie } = await loggedInUser()
    const { size } = await createVariant({ price: 50, stock: 10 })

    // Seed cart directly through Prisma — this test is about reading,
    // not about the add flow.
    await prisma.cart.create({
      data: {
        userId: user.id,
        items: { create: { productSizeId: size.id, quantity: 3 } },
      },
    })

    const res = await request(app).get('/api/cart').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items).toHaveLength(1)
    expect(res.body.data.cart.items[0]).toMatchObject({
      unitPrice: 50,
      subtotal: 150,
      quantity: 3,
    })
    expect(res.body.data.cart.total).toBe(150)
    expect(res.body.data.cart.totalItems).toBe(3)
  })

  it('uses the size-level price override when set', async () => {
    const { user, cookie } = await loggedInUser()
    // product price = 100, size override = 80
    const { size } = await createVariant({
      price: 100,
      sizePrice: 80,
      stock: 5,
    })

    await prisma.cart.create({
      data: {
        userId: user.id,
        items: { create: { productSizeId: size.id, quantity: 2 } },
      },
    })

    const res = await request(app).get('/api/cart').set('Cookie', cookie)

    expect(res.body.data.cart.items[0].unitPrice).toBe(80) // override won
    expect(res.body.data.cart.items[0].subtotal).toBe(160)
    expect(res.body.data.cart.total).toBe(160)
  })

  it('sums totals correctly across multiple items', async () => {
    const { user, cookie } = await loggedInUser()
    const v1 = await createVariant({ price: 30, stock: 10 })
    const v2 = await createVariant({ price: 70, stock: 10 })

    await prisma.cart.create({
      data: {
        userId: user.id,
        items: {
          create: [
            { productSizeId: v1.size.id, quantity: 2 }, // 60
            { productSizeId: v2.size.id, quantity: 1 }, // 70
          ],
        },
      },
    })

    const res = await request(app).get('/api/cart').set('Cookie', cookie)

    expect(res.body.data.cart.total).toBe(130)
    expect(res.body.data.cart.totalItems).toBe(3)
  })
})
