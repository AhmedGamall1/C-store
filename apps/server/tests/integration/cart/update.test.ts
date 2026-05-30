import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import prisma from '../../../src/config/database.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createVariant } from '../../factories/product.factory.js'

describe('PATCH /api/cart/items/:productSizeId', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .patch('/api/cart/items/x')
      .send({ quantity: 2 })
    expect(res.status).toBe(401)
  })

  it('updates the quantity to the exact value', async () => {
    const { user, cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 10 })
    await prisma.cart.create({
      data: {
        userId: user.id,
        items: { create: { productSizeId: size.id, quantity: 2 } },
      },
    })

    const res = await request(app)
      .patch(`/api/cart/items/${size.id}`)
      .set('Cookie', cookie)
      .send({ quantity: 7 })

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items[0].quantity).toBe(7) // not 2+7
  })

  it('returns 400 when quantity is invalid', async () => {
    const { user, cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 10 })
    await prisma.cart.create({
      data: {
        userId: user.id,
        items: { create: { productSizeId: size.id, quantity: 1 } },
      },
    })

    const res = await request(app)
      .patch(`/api/cart/items/${size.id}`)
      .set('Cookie', cookie)
      .send({ quantity: 0 })

    expect(res.status).toBe(400)
  })

  it('returns 400 when quantity exceeds stock', async () => {
    const { user, cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 3 })
    await prisma.cart.create({
      data: {
        userId: user.id,
        items: { create: { productSizeId: size.id, quantity: 1 } },
      },
    })

    const res = await request(app)
      .patch(`/api/cart/items/${size.id}`)
      .set('Cookie', cookie)
      .send({ quantity: 5 })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/3 units available/i)
  })

  it('returns 404 when the user has no cart yet', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5 })

    const res = await request(app)
      .patch(`/api/cart/items/${size.id}`)
      .set('Cookie', cookie)
      .send({ quantity: 2 })

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/cart not found/i)
  })

  it('returns 404 when the item is not in the cart', async () => {
    const { user, cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5 })
    const other = await createVariant({ stock: 5 })
    await prisma.cart.create({
      data: {
        userId: user.id,
        items: { create: { productSizeId: other.size.id, quantity: 1 } },
      },
    })

    const res = await request(app)
      .patch(`/api/cart/items/${size.id}`)
      .set('Cookie', cookie)
      .send({ quantity: 2 })

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/item not found/i)
  })
})
