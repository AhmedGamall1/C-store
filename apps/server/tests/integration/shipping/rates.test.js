import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { SHIPPING_RATES } from '../../../src/config/shipping.js'

describe('GET /api/shipping', () => {
  it('returns the full rates table', async () => {
    const res = await request(app).get('/api/shipping')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data.rates).toEqual(SHIPPING_RATES)
  })

  it('does not require auth', async () => {
    const res = await request(app).get('/api/shipping')
    expect(res.status).toBe(200)
  })
})

describe('GET /api/shipping/:governorate', () => {
  it('returns the cost for a known governorate', async () => {
    const res = await request(app).get('/api/shipping/cairo')

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual({ governorate: 'cairo', cost: 30 })
  })

  it('normalizes uppercase input', async () => {
    const res = await request(app).get('/api/shipping/CAIRO')
    expect(res.status).toBe(200)
    expect(res.body.data.cost).toBe(30)
  })

  it('normalizes spaces and hyphens to underscores', async () => {
    // SHIPPING_RATES key is "red_sea" — accept "red sea" and "red-sea"
    const a = await request(app).get('/api/shipping/red%20sea')
    const b = await request(app).get('/api/shipping/red-sea')
    expect(a.body.data.cost).toBe(75)
    expect(b.body.data.cost).toBe(75)
  })

  it('returns 404 for an unknown governorate', async () => {
    const res = await request(app).get('/api/shipping/atlantis')

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/no shipping/i)
  })
})
