import { api } from '@/lib/api'

export async function login({ email, password }) {
  const res = await api.post('/auth/login', { email, password })
  return res.data.user
}

export async function register({
  firstName,
  lastName,
  email,
  phone,
  password,
}) {
  const res = await api.post('/auth/register', {
    firstName,
    lastName,
    email,
    phone: phone || undefined,
    password,
  })
  return res.data.user
}

export async function logout() {
  return api.post('/auth/logout')
}

export async function getMe() {
  const res = await api.get('/auth/me')
  return res.data.user
}
