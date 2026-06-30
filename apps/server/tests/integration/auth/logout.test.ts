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
    expect(setCookie[0]).toMatch(/^accessToken=;/)
  })

  it('is idempotent: returns 200 even without a cookie', async () => {
    // Logout is public now — you must be able to end a session even when the
    // short-lived access token has already expired. It just revokes the refresh
    // session (if any) and clears the cookies.
    const res = await request(app).post('/api/auth/logout')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
  })
})
