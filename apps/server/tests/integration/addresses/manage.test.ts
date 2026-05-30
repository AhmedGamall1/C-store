import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createAddress } from '../../factories/address.factory.js'

describe('GET /api/addresses', () => {
  it("lists only the current user's addresses", async () => {
    const a = await loggedInUser({ email: 'a@example.com' })
    const b = await loggedInUser({ email: 'b@example.com' })

    await createAddress(a.user.id, { street: 'A1' })
    await createAddress(b.user.id, { street: 'B1' })

    const res = await request(app).get('/api/addresses').set('Cookie', a.cookie)

    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].street).toBe('A1')
  })
})

describe('PUT /api/addresses/:id', () => {
  it('updates fields the user owns', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id, { street: 'old' })

    const res = await request(app)
      .put(`/api/addresses/${addr.id}`)
      .set('Cookie', cookie)
      .send({ street: 'new' })

    expect(res.status).toBe(200)
    expect(res.body.data.street).toBe('new')
  })

  it("returns 404 when updating someone else's address", async () => {
    const a = await loggedInUser({ email: 'a@example.com' })
    const b = await loggedInUser({ email: 'b@example.com' })
    const addr = await createAddress(b.user.id)

    const res = await request(app)
      .put(`/api/addresses/${addr.id}`)
      .set('Cookie', a.cookie)
      .send({ street: 'hijack' })

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/not found/i)
  })

  it('returns 400 on empty PATCH body', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)

    const res = await request(app)
      .put(`/api/addresses/${addr.id}`)
      .set('Cookie', cookie)
      .send({})

    expect(res.status).toBe(400)
  })

  it('returns 400 for an invalid id format', async () => {
    const { cookie } = await loggedInUser()

    const res = await request(app)
      .put('/api/addresses/not-a-uuid')
      .set('Cookie', cookie)
      .send({ street: 'x' })

    expect(res.status).toBe(400)
  })
})
