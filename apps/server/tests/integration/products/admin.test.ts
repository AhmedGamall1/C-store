import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createVariant } from '../../factories/product.factory.js'

describe('GET /api/products/admin', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/products/admin')
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin users', async () => {
    const { cookie } = await loggedInUser({ role: 'CUSTOMER' })
    const res = await request(app)
      .get('/api/products/admin')
      .set('Cookie', cookie)
    expect(res.status).toBe(403)
  })

  it('returns active and inactive products for admin', async () => {
    const { cookie } = await loggedInUser({ role: 'ADMIN' })
    await createVariant({ productName: 'Live', productActive: true })
    await createVariant({ productName: 'Dead', productActive: false })

    const res = await request(app)
      .get('/api/products/admin')
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(2)
  })

  it('uses default admin limit of 20', async () => {
    const { cookie } = await loggedInUser({ role: 'ADMIN' })

    const res = await request(app)
      .get('/api/products/admin')
      .set('Cookie', cookie)

    expect(res.body.pagination.limit).toBe(20)
  })
})

describe('GET /api/products/admin/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get(
      '/api/products/admin/00000000-0000-0000-0000-000000000000'
    )
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin users', async () => {
    const { cookie } = await loggedInUser({ role: 'CUSTOMER' })
    const { product } = await createVariant()
    const res = await request(app)
      .get(`/api/products/admin/${product.id}`)
      .set('Cookie', cookie)
    expect(res.status).toBe(403)
  })

  it('returns 404 when the product id does not exist', async () => {
    const { cookie } = await loggedInUser({ role: 'ADMIN' })
    const res = await request(app)
      .get('/api/products/admin/00000000-0000-0000-0000-000000000000')
      .set('Cookie', cookie)

    expect(res.status).toBe(404)
  })

  it('returns the product even if it is inactive (admin sees all)', async () => {
    const { cookie } = await loggedInUser({ role: 'ADMIN' })
    const { product } = await createVariant({ productActive: false })

    const res = await request(app)
      .get(`/api/products/admin/${product.id}`)
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.data.product.id).toBe(product.id)
    expect(res.body.data.product.isActive).toBe(false)
  })

  it('includes colors with sizes nested', async () => {
    const { cookie } = await loggedInUser({ role: 'ADMIN' })
    const { product } = await createVariant()

    const res = await request(app)
      .get(`/api/products/admin/${product.id}`)
      .set('Cookie', cookie)

    expect(res.body.data.product.colors).toHaveLength(1)
    expect(res.body.data.product.colors[0].sizes).toHaveLength(1)
  })
})
