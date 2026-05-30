import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { createCategory } from '../../factories/product.factory.js'

describe('GET /api/categories/:slug', () => {
  it('returns 404 when no category matches the slug', async () => {
    const res = await request(app).get('/api/categories/does-not-exist')

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/not found/i)
  })

  it('returns the category for an existing slug', async () => {
    await createCategory({ name: 'Footwear', slug: 'footwear' })

    const res = await request(app).get('/api/categories/footwear')

    expect(res.status).toBe(200)
    expect(res.body.data.category.slug).toBe('footwear')
  })
})
