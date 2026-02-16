import { z } from 'zod'

export const mesaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  capacidad: z.coerce.number().min(1, 'La capacidad debe ser al menos 1').optional(),
  posicion_x: z.coerce.number().min(0).optional(),
  posicion_y: z.coerce.number().min(0).optional()
})
