import { z } from 'zod'

export const mesaSchema = z.object({
  nombre: z.string().min(2),
  posicion_x: z.coerce.number().min(0).optional(),
  posicion_y: z.coerce.number().min(0).optional()
})
