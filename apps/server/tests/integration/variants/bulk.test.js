import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { createVariant } from '../../factories/product.factory.js'

describe('GET /api/variants/bulk', () => {
  it('returns an empty array when no ids are provided', async () => {
    const res = await request(app).get('/api/variants/bulk')

    expect(res.status).toBe(200)
    expect(res.body.data.variants).toEqual([])
  })

  it('returns the requested variants in the flattened DTO shape', async () => {
    const v1 = await createVariant({ productName: 'P1', price: 30, stock: 5 })
    const v2 = await createVariant({ productName: 'P2', price: 50, stock: 8 })

    const res = await request(app).get(
      `/api/variants/bulk?ids=${v1.size.id},${v2.size.id}`
    )

    expect(res.body.data.variants).toHaveLength(2)

    const found = res.body.data.variants.find((v) => v.id === v1.size.id)
    expect(found).toMatchObject({
      id: v1.size.id,
      stock: 5,
      price: 30,
      productId: v1.product.id,
      productName: 'P1',
      colorId: v1.color.id,
    })
  })

  it('omits ids that do not match any variant', async () => {
    const { size } = await createVariant()

    const res = await request(app).get(
      `/api/variants/bulk?ids=${size.id},00000000-0000-0000-0000-000000000000`
    )

    expect(res.body.data.variants).toHaveLength(1)
    expect(res.body.data.variants[0].id).toBe(size.id)
  })

  it('reports isActive=false when any level (size/color/product) is inactive', async () => {
    const inactive = await createVariant({ productActive: false })

    const res = await request(app).get(
      `/api/variants/bulk?ids=${inactive.size.id}`
    )

    expect(res.body.data.variants[0].isActive).toBe(false)
  })

  it('uses size-level price override when present, otherwise product price', async () => {
    const v1 = await createVariant({ price: 100, sizePrice: 80 })
    const v2 = await createVariant({ price: 100 })

    const res = await request(app).get(
      `/api/variants/bulk?ids=${v1.size.id},${v2.size.id}`
    )

    expect(res.body.data.variants.find((v) => v.id === v1.size.id).price).toBe(
      80
    )
    expect(res.body.data.variants.find((v) => v.id === v2.size.id).price).toBe(
      100
    )
  })
})
