import { z } from 'zod'

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
})

export const slugParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
})

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const booleanString = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((v) => v === true || v === 'true' || v === '1')
