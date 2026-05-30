import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import prisma from '../../../src/config/database.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createVariant } from '../../factories/product.factory.js'
import { createAddress } from '../../factories/address.factory.js'

const placeOrder = async (cookie, addressId, productSizeId, qty = 1) => {
  const res = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ addressId, items: [{ productSizeId, quantity: qty }] })
  return res.body.data.order
}

describe('PATCH /api/orders/:id/cancel', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).patch(
      '/api/orders/00000000-0000-0000-0000-000000000000/cancel'
    )
    expect(res.status).toBe(401)
  })

  it('returns 404 when the order belongs to another user', async () => {
    const me = await loggedInUser()
    const them = await loggedInUser()
    const theirAddr = await createAddress(them.user.id)
    const v = await createVariant({ stock: 5 })
    const theirOrder = await placeOrder(them.cookie, theirAddr.id, v.size.id)

    const res = await request(app)
      .patch(`/api/orders/${theirOrder.id}/cancel`)
      .set('Cookie', me.cookie)

    expect(res.status).toBe(404)
  })

  it('cancels a PENDING order and restores stock', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)
    const v = await createVariant({ stock: 10 })
    const order = await placeOrder(cookie, addr.id, v.size.id, 3)

    // After ordering: stock = 7
    let after = await prisma.productSize.findUnique({
      where: { id: v.size.id },
    })
    expect(after.stock).toBe(7)

    const res = await request(app)
      .patch(`/api/orders/${order.id}/cancel`)
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.data.order.status).toBe('CANCELLED')

    // After cancel: stock back to 10
    after = await prisma.productSize.findUnique({ where: { id: v.size.id } })
    expect(after.stock).toBe(10)
  })

  it('refuses to cancel an order that is no longer PENDING', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)
    const v = await createVariant({ stock: 5 })
    const order = await placeOrder(cookie, addr.id, v.size.id)

    // Force-advance status outside the API
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'SHIPPED' },
    })

    const res = await request(app)
      .patch(`/api/orders/${order.id}/cancel`)
      .set('Cookie', cookie)

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/cannot cancel/i)
  })
})
