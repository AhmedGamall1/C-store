import { api } from '@/lib/api'
import type { User } from '@/types/api'

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
}

export async function login({ email, password }: LoginInput): Promise<User> {
  const res = await api.post<{ data: { user: User } }>('/auth/login', {
    email,
    password,
  })
  return res.data.user
}

export async function register({
  firstName,
  lastName,
  email,
  phone,
  password,
}: RegisterInput): Promise<User> {
  const res = await api.post<{ data: { user: User } }>('/auth/register', {
    firstName,
    lastName,
    email,
    phone: phone || undefined,
    password,
  })
  return res.data.user
}

export async function logout(): Promise<unknown> {
  return api.post('/auth/logout')
}

export async function getMe(): Promise<User> {
  const res = await api.get<{ data: { user: User } }>('/auth/me')
  return res.data.user
}
