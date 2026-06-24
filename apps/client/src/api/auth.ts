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

interface VerifyEmailInput {
  token: string
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

// Confirm an email address from the link sent on register. The token is
// single-use; a used/expired token returns 400.
export async function verifyEmail(token: VerifyEmailInput['token']): Promise<void> {
  await api.post('/auth/verify-email', { token })
}

// Re-send the verification email to the logged-in user (cookie auth, no body).
export async function resendVerification(): Promise<void> {
  await api.post('/auth/resend-verification')
}
