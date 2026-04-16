import { api } from '@/lib/api'

export async function login({ email, password }) {
  return api.post('/auth/login', { email, password })
}

export async function register({
  firstName,
  lastName,
  email,
  phone,
  password,
}) {
  return api.post('/auth/register', {
    firstName,
    lastName,
    email,
    phone: phone || undefined,
    password,
  })
}

export async function logout() {
  return api.post('/auth/logout')
}

export async function getMe() {
  return api.get('/auth/me')
}
