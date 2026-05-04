import { z } from 'zod'
import { booleanString } from './common.schema.js'

const name = z
  .string({ message: 'Name is required' })
  .trim()
  .min(1, 'Name is required')
  .max(60, 'Name is too long')

const description = z.string().trim().max(500).optional()

export const createCategoryBodySchema = z.object({
  name,
  description,
})

export const updateCategoryBodySchema = z
  .object({
    name: name.optional(),
    description,
    imageUrl: z.string().url().optional(),
    isActive: booleanString.optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

export { idParamSchema, slugParamSchema } from './common.schema.js'
