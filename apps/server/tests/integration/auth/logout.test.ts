import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { loggedInUser } from '../../helpers/auth.js'

describe('POST /api/auth/logout', () => {
  it('returns 200 and clears the auth cookie', async () => {
    const { cookie } = await loggedInUser()

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')

    // res.clearCookie sends a Set-Cookie with an empty value + past expiry
    const setCookie = res.headers['set-cookie']
    expect(setCookie[0]).toMatch(/^token=;/)
  })

  it('returns 401 when called without a cookie (logout requires auth)', async () => {
    const res = await request(app).post('/api/auth/logout')

    expect(res.status).toBe(401)
  })
})
