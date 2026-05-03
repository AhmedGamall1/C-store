import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { createVariant } from '../../factories/product.factory.js'

describe('GET /api/products/:slug', () => {
  it('returns 404 for an unknown slug', async () => {
    const res = await request(app).get('/api/products/does-not-exist')
    expect(res.status).toBe(404)
  })

  it('returns 404 for an inactive product', async () => {
    const { product } = await createVariant({ productActive: false })
    const res = await request(app).get(`/api/products/${product.slug}`)
    expect(res.status).toBe(404)
  })

  it('returns 404 when the product is in an inactive category', async () => {
    const { product } = await createVariant({ categoryActive: false })
    const res = await request(app).get(`/api/products/${product.slug}`)
    expect(res.status).toBe(404)
  })

  it('returns 404 when the product has no active color', async () => {
    const { product } = await createVariant({ colorActive: false })
    const res = await request(app).get(`/api/products/${product.slug}`)
    expect(res.status).toBe(404)
  })

  it('returns 404 when the product has no active size', async () => {
    const { product } = await createVariant({ sizeActive: false })
    const res = await request(app).get(`/api/products/${product.slug}`)
    expect(res.status).toBe(404)
  })

  it('returns the full product detail for a valid slug', async () => {
    const { product } = await createVariant({ productName: 'Detail Test' })

    const res = await request(app).get(`/api/products/${product.slug}`)

    expect(res.status).toBe(200)
    expect(res.body.data.product).toMatchObject({
      id: product.id,
      name: 'Detail Test',
    })
    expect(res.body.data.product.colors[0].sizes).toHaveLength(1)
    expect(res.body.data.product.reviews).toEqual([])
    expect(res.body.data.product._count.reviews).toBe(0)
  })

  it('only includes active colors and active sizes in the response', async () => {
    const { product, color } = await createVariant({ productName: 'Mixed' })
    const prisma = (await import('../../../src/config/database.js')).default

    await prisma.productColor.create({
      data: {
        productId: product.id,
        name: 'Hidden',
        imageUrl: 'https://example.test/h.jpg',
        imagePublicId: 'h',
        images: [],
        imagePublicIds: [],
        isActive: false,
      },
    })

    const res = await request(app).get(`/api/products/${product.slug}`)

    expect(res.body.data.product.colors).toHaveLength(1)
    expect(res.body.data.product.colors[0].id).toBe(color.id)
  })
})
