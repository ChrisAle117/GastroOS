import { z } from 'zod'

export const mesaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  capacidad: z.coerce.number().min(1, 'La capacidad debe ser al menos 1').optional(),
  posicion_x: z.coerce.number().min(0).optional(),
  posicion_y: z.coerce.number().min(0).optional(),
  salon_floor_id: z.string().uuid().optional(),
})

export const mesaEditSchema = mesaSchema.extend({
  width: z.coerce.number().min(48).optional(),
  height: z.coerce.number().min(48).optional(),
  shape: z.enum(['rect', 'round', 'bar']).optional(),
})
