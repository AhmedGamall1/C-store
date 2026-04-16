import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
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
