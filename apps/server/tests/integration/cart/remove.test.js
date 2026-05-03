import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import prisma from '../../../src/config/database.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createVariant } from '../../factories/product.factory.js'

describe('DELETE /api/cart/items/:productSizeId', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).delete('/api/cart/items/x')
    expect(res.status).toBe(401)
  })

  it('removes the item from the cart', async () => {
    const { user, cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5 })
    await prisma.cart.create({
      data: {
        userId: user.id,
        items: { create: { productSizeId: size.id, quantity: 2 } },
      },
    })

    const res = await request(app)
      .delete(`/api/cart/items/${size.id}`)
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items).toEqual([])
  })

  it('returns 404 when the user has no cart', async () => {
    const { cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5 })

    const res = await request(app)
      .delete(`/api/cart/items/${size.id}`)
      .set('Cookie', cookie)

    expect(res.status).toBe(404)
  })

  it('returns 404 when the item is not in the cart', async () => {
    const { user, cookie } = await loggedInUser()
    const { size } = await createVariant({ stock: 5 })
    await prisma.cart.create({ data: { userId: user.id } })

    const res = await request(app)
      .delete(`/api/cart/items/${size.id}`)
      .set('Cookie', cookie)

    expect(res.status).toBe(404)
  })
})
