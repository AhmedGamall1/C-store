import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import prisma from '../../../src/config/database.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createVariant } from '../../factories/product.factory.js'

describe('POST /api/cart/merge', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).post('/api/cart/merge').send({ items: [] })
    expect(res.status).toBe(401)
  })

  // ---------- inputs the merge must tolerate without throwing ----------
  it('returns the existing cart unchanged when items array is empty', async () => {
    const { cookie } = await loggedInUser()
    const res = await request(app)
      .post('/api/cart/merge')
      .set('Cookie', cookie)
      .send({ items: [] })

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items).toEqual([])
  })

  it('returns the existing cart when items is not an array', async () => {
    const { cookie } = await loggedInUser()
    const res = await request(app)
      .post('/api/cart/merge')
      .set('Cookie', cookie)
      .send({ items: 'oops' })

    expect(res.status).toBe(200)
  })

  // ---------- the actual merge ----------
  it('adds guest items to an empty cart', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 10, price: 25 })

    const res = await request(app)
      .post('/api/cart/merge')
      .set('Cookie', cookie)
      .send({ items: [{ productSizeId: size.id, quantity: 2 }] })

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items).toHaveLength(1)
    expect(res.body.data.cart.items[0].quantity).toBe(2)
    expect(res.body.data.cart.total).toBe(50)
  })

  it('de-duplicates the same productSizeId in the input array', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 10 })

    const res = await request(app)
      .post('/api/cart/merge')
      .set('Cookie', cookie)
      .send({
        items: [
          { productSizeId: size.id, quantity: 1 },
          { productSizeId: size.id, quantity: 2 },
        ],
      })

    expect(res.body.data.cart.items).toHaveLength(1)
    expect(res.body.data.cart.items[0].quantity).toBe(3) // 1 + 2
  })

  it('sums into existing cart items', async () => {
    const { user, cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 10 })
    await prisma.cart.create({
      data: {
        userId: user.id,
        items: { create: { productSizeId: size.id, quantity: 1 } },
      },
    })

    await request(app)
      .post('/api/cart/merge')
      .set('Cookie', cookie)
      .send({ items: [{ productSizeId: size.id, quantity: 2 }] })

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    })
    expect(cart.items[0].quantity).toBe(3)
  })

  it('clamps merged quantity to available stock', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 4 })

    const res = await request(app)
      .post('/api/cart/merge')
      .set('Cookie', cookie)
      .send({ items: [{ productSizeId: size.id, quantity: 99 }] })

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items[0].quantity).toBe(4) // clamped, not rejected
  })

  it('silently skips inactive variants (does not 410 the whole request)', async () => {
    const { cookie } = await loggedInUser()
    const live = await createVariant({ stock: 5 })
    const dead = await createVariant({ stock: 5, productActive: false })

    const res = await request(app)
      .post('/api/cart/merge')
      .set('Cookie', cookie)
      .send({
        items: [
          { productSizeId: live.size.id, quantity: 1 },
          { productSizeId: dead.size.id, quantity: 1 },
        ],
      })

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items).toHaveLength(1)
    expect(res.body.data.cart.items[0].productSize.id).toBe(live.size.id)
  })

  it('silently skips items with invalid productSizeId or non-positive quantity', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5 })

    const res = await request(app)
      .post('/api/cart/merge')
      .set('Cookie', cookie)
      .send({
        items: [
          { productSizeId: size.id, quantity: 1 },
          { productSizeId: null, quantity: 1 },
          { productSizeId: size.id, quantity: 0 },
          { productSizeId: size.id, quantity: -3 },
        ],
      })

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items[0].quantity).toBe(1) // only valid one
  })
})
