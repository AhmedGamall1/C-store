import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import prisma from '../../src/config/database.js'
import { createUser } from '../factories/user.factory.js'

describe('POST /api/auth/register', () => {
  // ---------- happy path ----------
  it('creates a user and returns 201 with the user (no password)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'jane@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('success')
    expect(res.body.data.user).toMatchObject({
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'CUSTOMER',
      isActive: true,
    })
    // Password must never leave the server
    expect(res.body.data.user.password).toBeUndefined()
  })

  it('persists the user in the database', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'jane@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    })

    const user = await prisma.user.findUnique({
      where: { email: 'jane@example.com' },
    })
    expect(user).not.toBeNull()
    expect(user.password).not.toBe('password123') // must be hashed
  })

  it('creates an empty cart for the new user', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'jane@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    })

    const user = await prisma.user.findUnique({
      where: { email: 'jane@example.com' },
      include: { cart: { include: { items: true } } },
    })
    expect(user.cart).not.toBeNull()
    expect(user.cart.items).toEqual([])
  })

  it('sets an httpOnly auth cookie', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'jane@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    })

    const setCookie = res.headers['set-cookie']
    expect(setCookie).toBeDefined()
    expect(setCookie[0]).toMatch(/^token=/)
    expect(setCookie[0]).toMatch(/HttpOnly/)
    expect(setCookie[0]).toMatch(/SameSite=Strict/i)
  })

  it('lowercases and trims the email', async () => {
    await request(app).post('/api/auth/register').send({
      email: '  JANE@Example.COM  ',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    })

    const user = await prisma.user.findUnique({
      where: { email: 'jane@example.com' },
    })
    expect(user).not.toBeNull()
  })

  // ---------- validation failures ----------
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'jane@example.com' }) // missing password, names

    expect(res.status).toBe(400)
    expect(res.body.status).toBe('fail')
    expect(res.body.message).toMatch(/required/i)
  })

  it('returns 400 when password is shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'jane@example.com',
      password: 'short',
      firstName: 'Jane',
      lastName: 'Doe',
    })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/8 characters/i)
  })

  // ---------- conflict ----------
  it('returns 409 when the email is already registered', async () => {
    await createUser({ email: 'taken@example.com' })

    const res = await request(app).post('/api/auth/register').send({
      email: 'taken@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    })

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/already exists/i)
  })

  it('does not create a duplicate user on conflict', async () => {
    await createUser({ email: 'taken@example.com' })

    await request(app).post('/api/auth/register').send({
      email: 'taken@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    })

    const count = await prisma.user.count({
      where: { email: 'taken@example.com' },
    })
    expect(count).toBe(1)
  })
})
