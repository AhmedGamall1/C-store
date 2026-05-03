import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import prisma from '../../../src/config/database.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createVariant } from '../../factories/product.factory.js'

describe('POST /api/cart/items', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .send({ productSizeId: 'x', quantity: 1 })
    expect(res.status).toBe(401)
  })

  // ---------- happy path ----------
  it('adds an item and returns 201 with the cart', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ price: 50, stock: 10 })

    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 2 })

    expect(res.status).toBe(201)
    expect(res.body.data.cart.items).toHaveLength(1)
    expect(res.body.data.cart.items[0]).toMatchObject({
      quantity: 2,
      unitPrice: 50,
      subtotal: 100,
    })
  })

  it('creates the cart on first add (lazy upsert)', async () => {
    const { user, cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5 })

    expect(
      await prisma.cart.findUnique({ where: { userId: user.id } })
    ).toBeNull()

    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 1 })

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } })
    expect(cart).not.toBeNull()
  })

  it('combines quantity when adding the same size twice', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 10 })

    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 2 })

    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 3 })

    expect(res.status).toBe(201)
    expect(res.body.data.cart.items).toHaveLength(1)
    expect(res.body.data.cart.items[0].quantity).toBe(5)
  })

  // ---------- validation ----------
  it('returns 400 when productSizeId is missing', async () => {
    const { cookie } = await loggedInUser()
    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ quantity: 1 })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/productSizeId/i)
  })

  it('returns 400 when quantity is zero or negative', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5 })

    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 0 })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/at least 1/i)
  })

  // ---------- variant state ----------
  it('returns 404 when the variant does not exist', async () => {
    const { cookie } = await loggedInUser()
    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({
        productSizeId: '00000000-0000-0000-0000-000000000000',
        quantity: 1,
      })

    expect(res.status).toBe(404)
  })

  it('returns 410 when the variant size is inactive', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5, sizeActive: false })

    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 1 })

    expect(res.status).toBe(410)
  })

  it('returns 410 when the parent color is inactive', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5, colorActive: false })

    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 1 })

    expect(res.status).toBe(410)
  })

  it('returns 410 when the parent product is inactive', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5, productActive: false })

    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 1 })

    expect(res.status).toBe(410)
  })

  // ---------- stock ----------
  it('returns 400 when the variant is out of stock', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 0 })

    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 1 })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/out of stock/i)
  })

  it('returns 400 when requested quantity exceeds stock', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 3 })

    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 5 })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/remaining/i)
  })

  it('rejects when combined quantity (existing + new) would exceed stock', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5 })

    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 3 })

    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productSizeId: size.id, quantity: 3 }) // total would be 6 > 5

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/2 remaining/i)
  })
})
