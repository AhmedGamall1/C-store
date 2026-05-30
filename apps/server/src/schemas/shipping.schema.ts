import { z } from 'zod'

export const governorateParamSchema = z.object({
  governorate: z
    .string()
    .trim()
    .min(1, 'Governorate is required')
    .max(80, 'Governorate is too long'),
})
