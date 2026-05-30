import { z } from 'zod'

const productSizeId = z.string().uuid('Invalid productSizeId')
const quantity = z
  .number({ message: 'Quantity must be a number' })
  .int('Quantity must be a whole number')
  .min(1, 'Quantity must be at least 1')

export const productSizeIdParamSchema = z.object({
  productSizeId,
})

export const addItemBodySchema = z.object({
  productSizeId,
  quantity,
})

export const updateItemBodySchema = z.object({
  quantity,
})

export const mergeCartBodySchema = z.object({
  items: z.array(z.unknown()).catch([]),
})

export type AddItemInput = z.infer<typeof addItemBodySchema>
export type UpdateItemInput = z.infer<typeof updateItemBodySchema>
