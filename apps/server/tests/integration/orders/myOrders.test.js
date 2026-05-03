import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createVariant } from '../../factories/product.factory.js'
import { createAddress } from '../../factories/address.factory.js'

// Helper local to this file — places one COD order and returns it.
const placeOrder = async (cookie, addressId, productSizeId, quantity = 1) => {
  const res = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({
      addressId,
      items: [{ productSizeId, quantity }],
    })
  return res.body.data.order
}

describe('GET /api/orders', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/orders')
    expect(res.status).toBe(401)
  })

  it('returns only the current user’s orders', async () => {
    const me = await loggedInUser()
    const myAddr = await createAddress(me.user.id)
    const myV = await createVariant({ stock: 5 })
    await placeOrder(me.cookie, myAddr.id, myV.size.id)

    const them = await loggedInUser()
    const theirAddr = await createAddress(them.user.id)
    const theirV = await createVariant({ stock: 5 })
    await placeOrder(them.cookie, theirAddr.id, theirV.size.id)

    const res = await request(app).get('/api/orders').set('Cookie', me.cookie)

    expect(res.status).toBe(200)
    expect(res.body.results).toBe(1)
    expect(res.body.data.orders).toHaveLength(1)
    expect(res.body.data.orders[0].userId).toBe(me.user.id)
  })

  it('returns orders newest-first', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)
    const v1 = await createVariant({ stock: 5 })
    const v2 = await createVariant({ stock: 5 })

    const first = await placeOrder(cookie, addr.id, v1.size.id)
    const second = await placeOrder(cookie, addr.id, v2.size.id)

    const res = await request(app).get('/api/orders').set('Cookie', cookie)

    expect(res.body.data.orders[0].id).toBe(second.id)
    expect(res.body.data.orders[1].id).toBe(first.id)
  })
})

describe('GET /api/orders/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get(
      '/api/orders/00000000-0000-0000-0000-000000000000'
    )
    expect(res.status).toBe(401)
  })

  it('returns 404 for an unknown id', async () => {
    const { cookie } = await loggedInUser()
    const res = await request(app)
      .get('/api/orders/00000000-0000-0000-0000-000000000000')
      .set('Cookie', cookie)
    expect(res.status).toBe(404)
  })

  it('returns 404 when the order belongs to another user', async () => {
    const me = await loggedInUser()
    const them = await loggedInUser()
    const theirAddr = await createAddress(them.user.id)
    const v = await createVariant({ stock: 5 })
    const theirOrder = await placeOrder(them.cookie, theirAddr.id, v.size.id)

    const res = await request(app)
      .get(`/api/orders/${theirOrder.id}`)
      .set('Cookie', me.cookie)

    // 404, not 403 — never reveal the order exists to non-owners
    expect(res.status).toBe(404)
  })

  it('returns the full order with items for the owner', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)
    const v = await createVariant({ stock: 5 })
    const order = await placeOrder(cookie, addr.id, v.size.id)

    const res = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.data.order.id).toBe(order.id)
    expect(res.body.data.order.items).toHaveLength(1)
  })
})
