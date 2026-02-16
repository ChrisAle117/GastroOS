import { z } from 'zod'

export const insumoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  unidad_medida: z.string().min(1, 'Selecciona una unidad de medida'),
  stock_actual: z.coerce.number().min(0, 'El stock debe ser mayor o igual a 0'),
  stock_minimo: z.coerce.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  costo_unitario: z.coerce.number().min(0, 'El costo debe ser mayor o igual a 0')
})
