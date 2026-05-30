import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import prisma from '../../../src/config/database.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createVariant } from '../../factories/product.factory.js'

describe('DELETE /api/cart', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).delete('/api/cart')
    expect(res.status).toBe(401)
  })

  it('removes all items, leaving the cart empty', async () => {
    const { user, cookie } = await loggedInUser()
    const v1 = await createVariant({ stock: 5 })
    const v2 = await createVariant({ stock: 5 })
    await prisma.cart.create({
      data: {
        userId: user.id,
        items: {
          create: [
            { productSizeId: v1.size.id, quantity: 1 },
            { productSizeId: v2.size.id, quantity: 1 },
          ],
        },
      },
    })

    const res = await request(app).delete('/api/cart').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items).toEqual([])
    expect(res.body.data.cart.total).toBe(0)
  })

  it('returns 404 when the user has no cart yet', async () => {
    const { cookie } = await loggedInUser()
    const res = await request(app).delete('/api/cart').set('Cookie', cookie)
    expect(res.status).toBe(404)
  })
})
