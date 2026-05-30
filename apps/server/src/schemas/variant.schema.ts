import { z } from 'zod'
import { booleanString, idParamSchema } from './common.schema.js'

const uuid = z.string().uuid('Invalid id')

export const colorParamsSchema = z.object({
  id: uuid, // productId
  colorId: uuid,
})

export const sizeParamsSchema = z.object({
  id: uuid, // productId
  colorId: uuid,
  sizeId: uuid,
})

// ---------- size fields ----------
const sizeLabel = z
  .string({ message: 'Size label is required' })
  .trim()
  .min(1, 'Size label is required')
  .max(20)

// Required stock — missing/blank means 0.
const stock = z.preprocess(
  (v) => (v === '' || v == null ? 0 : v),
  z.coerce.number().int().nonnegative('Stock must be a non-negative integer')
)

// Optional stock — missing/blank means "don't change".
const optionalStock = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.coerce
    .number()
    .int()
    .nonnegative('Stock must be a non-negative integer')
    .optional()
)

const sku = z.string().trim().max(60).optional()

const optionalPrice = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.coerce.number().positive('Price must be greater than zero').optional()
)

// ---------- color fields ----------
const colorName = z
  .string({ message: 'Color name is required' })
  .trim()
  .min(1, 'Color name is required')
  .max(80)

const hex = z.string().trim().max(7).optional()

// One item inside the JSON `sizes` array on color create.
const sizeInit = z.object({
  size: sizeLabel,
  stock,
  sku,
  price: optionalPrice,
})

// The `sizes` body field arrives as a JSON-encoded string (multipart upload).
// If parsing fails we pass the raw value through so the array check reports it.
const sizesJsonField = z.preprocess((v) => {
  if (v === '' || v == null) return undefined
  if (typeof v !== 'string') return v
  try {
    return JSON.parse(v)
  } catch {
    return v
  }
}, z.array(sizeInit).optional())

export const addColorBodySchema = z.object({
  name: colorName,
  hex,
  sizes: sizesJsonField,
})

export const updateColorBodySchema = z
  .object({
    name: colorName.optional(),
    hex,
    isActive: booleanString.optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

export const addSizeBodySchema = z.object({
  size: sizeLabel,
  stock,
  sku,
  price: optionalPrice,
})

export const updateSizeBodySchema = z
  .object({
    size: sizeLabel.optional(),
    stock: optionalStock,
    sku,
    price: optionalPrice,
    isActive: booleanString.optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

export const variantsBulkQuerySchema = z.object({
  ids: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
})

export type AddColorInput = z.infer<typeof addColorBodySchema>
export type UpdateColorInput = z.infer<typeof updateColorBodySchema>
export type AddSizeInput = z.infer<typeof addSizeBodySchema>
export type UpdateSizeInput = z.infer<typeof updateSizeBodySchema>

export { idParamSchema }
