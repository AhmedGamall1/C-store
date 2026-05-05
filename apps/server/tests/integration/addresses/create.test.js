import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { loggedInUser } from '../../helpers/auth.js'

describe('POST /api/addresses', () => {
  it('creates an address and auto-marks the first one as default', async () => {
    const { cookie } = await loggedInUser()

    const res = await request(app)
      .post('/api/addresses')
      .set('Cookie', cookie)
      .send({ street: '12 Tahrir', city: 'Cairo', governorate: 'cairo' })

    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({
      street: '12 Tahrir',
      city: 'Cairo',
      governorate: 'cairo',
      isDefault: true, // first address is always default
    })
  })

  it('honors isDefault=false when not the first address', async () => {
    const { cookie } = await loggedInUser()
    await request(app)
      .post('/api/addresses')
      .set('Cookie', cookie)
      .send({ street: '1 First', city: 'Cairo', governorate: 'cairo' })

    const res = await request(app)
      .post('/api/addresses')
      .set('Cookie', cookie)
      .send({
        street: '2 Second',
        city: 'Giza',
        governorate: 'giza',
        isDefault: false,
      })

    expect(res.body.data.isDefault).toBe(false)
  })

  it('demotes the previous default when a new default is created', async () => {
    const { user, cookie } = await loggedInUser()
    await request(app)
      .post('/api/addresses')
      .set('Cookie', cookie)
      .send({ street: '1 First', city: 'Cairo', governorate: 'cairo' })

    await request(app).post('/api/addresses').set('Cookie', cookie).send({
      street: '2 Second',
      city: 'Giza',
      governorate: 'giza',
      isDefault: true,
    })

    const list = await request(app).get('/api/addresses').set('Cookie', cookie)
    const defaults = list.body.data.filter((a) => a.isDefault)
    expect(defaults).toHaveLength(1)
    expect(defaults[0].street).toBe('2 Second')
    // ensure the user binding is correct
    expect(list.body.data.every((a) => a.userId === user.id)).toBe(true)
  })

  it('returns 400 with per-field errors when required fields are missing', async () => {
    const { cookie } = await loggedInUser()

    const res = await request(app)
      .post('/api/addresses')
      .set('Cookie', cookie)
      .send({ street: '12 Tahrir' }) // missing city, governorate

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation failed')
    const paths = res.body.errors.map((e) => e.path)
    expect(paths).toEqual(expect.arrayContaining(['city', 'governorate']))
  })

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/addresses')
      .send({ street: '1', city: 'Cairo', governorate: 'cairo' })
    expect(res.status).toBe(401)
  })
})
