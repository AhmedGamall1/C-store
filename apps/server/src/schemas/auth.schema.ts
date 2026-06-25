import { z } from 'zod'

const email = z
  .string({ message: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Invalid email address')

const strongPassword = z
  .string({ message: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')

const name = (label: string) =>
  z
    .string({ message: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(50, `${label} is too long`)

const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s-]{7,20}$/, 'Invalid phone number')
  .optional()

export const registerSchema = z.object({
  firstName: name('First name'),
  lastName: name('Last name'),
  email,
  password: strongPassword,
  phone,
})

export const loginSchema = z.object({
  email,
  password: z
    .string({ message: 'Password is required' })
    .min(1, 'Password is required'),
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: strongPassword,
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
