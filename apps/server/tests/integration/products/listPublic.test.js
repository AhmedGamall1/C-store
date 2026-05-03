import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import {
  createVariant,
  createVariants,
} from '../../factories/product.factory.js'

describe('GET /api/products', () => {
  // ---------- empty + happy path ----------
  it('returns an empty list with pagination shape', async () => {
    const res = await request(app).get('/api/products')

    expect(res.status).toBe(200)
    expect(res.body.products).toEqual([])
    expect(res.body.pagination).toMatchObject({
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    })
  })

  it('returns active products with at least one sellable variant', async () => {
    await createVariant({ productName: 'Visible Shoe' })

    const res = await request(app).get('/api/products')

    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].name).toBe('Visible Shoe')
  })

  // ---------- visibility filters ----------
  it('excludes inactive products', async () => {
    await createVariant({ productName: 'Live', productActive: true })
    await createVariant({ productName: 'Dead', productActive: false })

    const res = await request(app).get('/api/products')

    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].name).toBe('Live')
  })

  it('excludes products in inactive categories', async () => {
    await createVariant({ productName: 'OK' })
    await createVariant({ productName: 'BadCat', categoryActive: false })

    const res = await request(app).get('/api/products')

    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].name).toBe('OK')
  })

  it('excludes products with no active color', async () => {
    await createVariant({ productName: 'OK' })
    await createVariant({ productName: 'NoColor', colorActive: false })

    const res = await request(app).get('/api/products')

    expect(res.body.products.map((p) => p.name)).toEqual(['OK'])
  })

  it('excludes products whose only color has no active size', async () => {
    await createVariant({ productName: 'OK' })
    await createVariant({ productName: 'NoSize', sizeActive: false })

    const res = await request(app).get('/api/products')

    expect(res.body.products.map((p) => p.name)).toEqual(['OK'])
  })

  // ---------- pagination ----------
  it('paginates results with default limit of 12', async () => {
    await createVariants(15)

    const page1 = await request(app).get('/api/products?page=1')
    expect(page1.body.products).toHaveLength(12)
    expect(page1.body.pagination).toMatchObject({
      total: 15,
      page: 1,
      limit: 12,
      totalPages: 2,
      hasNextPage: true,
      hasPrevPage: false,
    })

    const page2 = await request(app).get('/api/products?page=2')
    expect(page2.body.products).toHaveLength(3)
    expect(page2.body.pagination).toMatchObject({
      page: 2,
      hasNextPage: false,
      hasPrevPage: true,
    })
  })

  it('respects a custom limit', async () => {
    await createVariants(5)

    const res = await request(app).get('/api/products?limit=2')
    expect(res.body.products).toHaveLength(2)
    expect(res.body.pagination.totalPages).toBe(3)
  })

  // ---------- filtering ----------
  it('filters by category slug', async () => {
    const a = await createVariant({ productName: 'A' })
    await createVariant({ productName: 'B' })

    const res = await request(app).get(
      `/api/products?category=${a.category.slug}`
    )

    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].name).toBe('A')
  })

  it('filters by minPrice and maxPrice', async () => {
    await createVariant({ productName: 'Cheap', price: 10 })
    await createVariant({ productName: 'Mid', price: 50 })
    await createVariant({ productName: 'Pricey', price: 200 })

    const res = await request(app).get('/api/products?minPrice=20&maxPrice=100')

    expect(res.body.products.map((p) => p.name)).toEqual(['Mid'])
  })

  it('filters by case-insensitive search on name', async () => {
    await createVariant({ productName: 'Running Shoe' })
    await createVariant({ productName: 'Casual Sneaker' })

    const res = await request(app).get('/api/products?search=RUNNING')

    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].name).toBe('Running Shoe')
  })

  // ---------- sorting ----------
  it('sorts by price ascending when sortBy=price&order=asc', async () => {
    await createVariant({ productName: 'A', price: 30 })
    await createVariant({ productName: 'B', price: 10 })
    await createVariant({ productName: 'C', price: 20 })

    const res = await request(app).get('/api/products?sortBy=price&order=asc')

    expect(res.body.products.map((p) => p.name)).toEqual(['B', 'C', 'A'])
  })

  it('falls back to createdAt for an unknown sortBy (no SQL injection)', async () => {
    await createVariants(3)

    const res = await request(app).get(
      '/api/products?sortBy=DROP_TABLE&order=asc'
    )

    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(3)
  })
})
