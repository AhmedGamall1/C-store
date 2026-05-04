import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { createUser } from '../../factories/user.factory.js'

describe('POST /api/auth/login', () => {
  // ---------- happy path ----------
  it('returns 200 and the user (no password) on valid credentials', async () => {
    await createUser({ email: 'jane@example.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data.user).toMatchObject({
      email: 'jane@example.com',
      role: 'CUSTOMER',
    })
    expect(res.body.data.user.password).toBeUndefined()
  })

  it('sets an httpOnly auth cookie on success', async () => {
    await createUser({ email: 'jane@example.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'password123' })

    const setCookie = res.headers['set-cookie']
    expect(setCookie[0]).toMatch(/^token=/)
    expect(setCookie[0]).toMatch(/HttpOnly/)
    expect(setCookie[0]).toMatch(/SameSite=Strict/i)
  })

  it('accepts email with surrounding whitespace and uppercase', async () => {
    await createUser({ email: 'jane@example.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '  JANE@Example.COM  ', password: 'password123' })

    expect(res.status).toBe(200)
  })

  // ---------- validation ----------
  it('returns 400 with a per-field error when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation failed')
    expect(res.body.errors.some((e) => e.path === 'email')).toBe(true)
  })

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com' })

    expect(res.status).toBe(400)
  })

  // ---------- credential failures ----------
  it('returns 401 for an unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/invalid email or password/i)
  })

  it('returns 401 for a wrong password', async () => {
    await createUser({ email: 'jane@example.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
    // Same message as unknown email — never leak which one was wrong
    expect(res.body.message).toMatch(/invalid email or password/i)
  })

  // ---------- account state ----------
  it('returns 403 for a deactivated account', async () => {
    await createUser({
      email: 'jane@example.com',
      password: 'password123',
      isActive: false,
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'password123' })

    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/deactivated/i)
  })
})
