import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
})

// Mirrors the backend rule: min 8 / max 128, and the two fields must match.
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .max(128, 'At most 128 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^[+\d\s-]+$/.test(v), 'Enter a valid phone number')
    .transform((v) => (v === '' ? undefined : v)),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Needs one uppercase letter')
    .regex(/\d/, 'Needs one number'),
})
