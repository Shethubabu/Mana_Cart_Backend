import { z } from "zod"

export const productQuerySchema = z.object({
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => Number(val) || 1),
  limit: z
    .string()
    .optional()
    .transform((val) => Number(val) || 10),
})

export type ProductQuery = z.infer<typeof productQuerySchema>