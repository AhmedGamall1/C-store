import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { loggedInUser } from '../../helpers/auth.js'
import { tamperedCookie } from '../../helpers/auth.js'

describe('GET /api/auth/me', () => {
  it('returns the authenticated user (no password)', async () => {
    const { user, cookie } = await loggedInUser({
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
    })

    const res = await request(app).get('/api/auth/me').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.data.user).toMatchObject({
      id: user.id,
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'CUSTOMER',
    })
    expect(res.body.data.user.password).toBeUndefined()
  })

  it('returns 401 when no cookie is sent', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/not logged in/i)
  })

  it('returns 401 for a token signed with the wrong secret', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', tamperedCookie())

    expect(res.status).toBe(401)
  })

  it('returns 401 if the user behind a valid token no longer exists', async () => {
    const { user, cookie } = await loggedInUser()

    // Delete the user but keep the (still cryptographically valid) cookie
    const prisma = (await import('../../../src/config/database.js')).default
    await prisma.user.delete({ where: { id: user.id } })

    const res = await request(app).get('/api/auth/me').set('Cookie', cookie)

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/no longer exists/i)
  })
})
