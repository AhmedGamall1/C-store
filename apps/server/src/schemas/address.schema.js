import { z } from 'zod'

const street = z
  .string({ message: 'Street is required' })
  .trim()
  .min(1, 'Street is required')
  .max(200, 'Street is too long')

const city = z
  .string({ message: 'City is required' })
  .trim()
  .min(1, 'City is required')
  .max(80)

const governorate = z
  .string({ message: 'Governorate is required' })
  .trim()
  .min(1, 'Governorate is required')
  .max(80)

export const createAddressBodySchema = z.object({
  street,
  city,
  governorate,
  isDefault: z.boolean().optional(),
})

export const updateAddressBodySchema = z
  .object({
    street: street.optional(),
    city: city.optional(),
    governorate: governorate.optional(),
    isDefault: z.boolean().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

export { idParamSchema } from './common.schema.js'
