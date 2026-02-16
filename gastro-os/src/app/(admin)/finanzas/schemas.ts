import { z } from 'zod'

export const mermaSchema = z.object({
  motivo: z.string().min(2),
  costo: z.coerce.number().min(0)
})
