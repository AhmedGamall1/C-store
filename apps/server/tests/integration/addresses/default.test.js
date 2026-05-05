import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/app.js'
import { loggedInUser } from '../../helpers/auth.js'
import { createAddress } from '../../factories/address.factory.js'

describe('PATCH /api/addresses/:id/default', () => {
  it('promotes the chosen address and demotes others', async () => {
    const { user, cookie } = await loggedInUser()
    const a = await createAddress(user.id, { isDefault: true, street: 'A' })
    const b = await createAddress(user.id, { isDefault: false, street: 'B' })

    const res = await request(app)
      .patch(`/api/addresses/${b.id}/default`)
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(b.id)
    expect(res.body.data.isDefault).toBe(true)

    const list = await request(app).get('/api/addresses').set('Cookie', cookie)
    const defaults = list.body.data.filter((x) => x.isDefault)
    expect(defaults).toHaveLength(1)
    expect(defaults[0].id).toBe(b.id)
    expect(list.body.data.find((x) => x.id === a.id).isDefault).toBe(false)
  })
})

describe('DELETE /api/addresses/:id', () => {
  it('returns 204 and removes the address', async () => {
    const { user, cookie } = await loggedInUser()
    const addr = await createAddress(user.id)

    const res = await request(app)
      .delete(`/api/addresses/${addr.id}`)
      .set('Cookie', cookie)

    expect(res.status).toBe(204)

    const list = await request(app).get('/api/addresses').set('Cookie', cookie)
    expect(list.body.data).toHaveLength(0)
  })

  it('promotes the oldest remaining address when the default is deleted', async () => {
    const { user, cookie } = await loggedInUser()
    const a = await createAddress(user.id, { isDefault: true, street: 'A' })
    const b = await createAddress(user.id, { isDefault: false, street: 'B' })
    const c = await createAddress(user.id, { isDefault: false, street: 'C' })

    await request(app).delete(`/api/addresses/${a.id}`).set('Cookie', cookie)

    const list = await request(app).get('/api/addresses').set('Cookie', cookie)
    // b was created before c → b is the oldest remaining → becomes default
    expect(list.body.data.find((x) => x.id === b.id).isDefault).toBe(true)
    expect(list.body.data.find((x) => x.id === c.id).isDefault).toBe(false)
  })

  it("returns 404 when deleting someone else's address", async () => {
    const a = await loggedInUser({ email: 'a@example.com' })
    const b = await loggedInUser({ email: 'b@example.com' })
    const addr = await createAddress(b.user.id)

    const res = await request(app)
      .delete(`/api/addresses/${addr.id}`)
      .set('Cookie', a.cookie)

    expect(res.status).toBe(404)
  })
})
