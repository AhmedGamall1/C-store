import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import {
  protect,
  restrictTo,
  optionalAuth,
} from '../../../src/middlewares/auth.middleware.js'
import cookieParser from 'cookie-parser'
import { loggedInUser } from '../../helpers/auth.js'

// Build a mini app that exercises each middleware branch in isolation.
// We can't test restrictTo and optionalAuth via the production routes
// (no route uses them yet), so we mount them on test-only endpoints.
let testApp

beforeAll(() => {
  testApp = express()
  testApp.use(cookieParser())
  testApp.use(express.json())

  testApp.get('/protected', protect, (req, res) => {
    res.json({ userId: req.user.id })
  })

  testApp.get('/admin-only', protect, restrictTo('ADMIN'), (req, res) => {
    res.json({ ok: true })
  })

  testApp.get('/optional', optionalAuth, (req, res) => {
    res.json({ userId: req.user?.id ?? null })
  })

  // The same global error handler app.js uses — required for AppError throws
  // to become JSON responses instead of crashing.
  testApp.use((err, req, res, _next) => {
    res
      .status(err.statusCode || 500)
      .json({ status: err.status || 'error', message: err.message })
  })
})

describe('auth middleware: protect', () => {
  it('allows an authenticated request through', async () => {
    const { user, cookie } = await loggedInUser()
    const res = await request(testApp).get('/protected').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.userId).toBe(user.id)
  })

  it('rejects requests with no cookie', async () => {
    const res = await request(testApp).get('/protected')
    expect(res.status).toBe(401)
  })

  it('rejects deactivated users even with a valid cookie', async () => {
    const { cookie, user } = await loggedInUser({ isActive: true })

    // Deactivate after issuing the cookie
    const prisma = (await import('../../../src/config/database.js')).default
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    })

    const res = await request(testApp).get('/protected').set('Cookie', cookie)
    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/deactivated/i)
  })
})

describe('auth middleware: restrictTo', () => {
  it('allows a user whose role is in the allowlist', async () => {
    const { cookie } = await loggedInUser({ role: 'ADMIN' })
    const res = await request(testApp).get('/admin-only').set('Cookie', cookie)
    expect(res.status).toBe(200)
  })

  it('rejects a user whose role is not in the allowlist', async () => {
    const { cookie } = await loggedInUser({ role: 'CUSTOMER' })
    const res = await request(testApp).get('/admin-only').set('Cookie', cookie)
    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/permission/i)
  })

  it('rejects unauthenticated requests at the protect step', async () => {
    const res = await request(testApp).get('/admin-only')
    expect(res.status).toBe(401) // protect runs first
  })
})

describe('auth middleware: optionalAuth', () => {
  it('attaches req.user when a valid cookie is present', async () => {
    const { user, cookie } = await loggedInUser()
    const res = await request(testApp).get('/optional').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.userId).toBe(user.id)
  })

  it('passes through without req.user when no cookie is sent', async () => {
    const res = await request(testApp).get('/optional')

    expect(res.status).toBe(200)
    expect(res.body.userId).toBeNull()
  })

  it('passes through silently on an invalid token (does not error)', async () => {
    const res = await request(testApp)
      .get('/optional')
      .set('Cookie', 'token=garbage')

    expect(res.status).toBe(200)
    expect(res.body.userId).toBeNull()
  })

  it('does not attach req.user for a deactivated user', async () => {
    const { cookie, user } = await loggedInUser({ isActive: true })
    const prisma = (await import('../../../src/config/database.js')).default
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    })

    const res = await request(testApp).get('/optional').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.userId).toBeNull()
  })
})
