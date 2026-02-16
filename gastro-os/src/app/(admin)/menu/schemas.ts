import { z } from 'zod'

export const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  precio: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  categoria: z.string().optional(),
  descripcion: z.string().optional(),
})

export const insumoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  unidad_medida: z.string().min(1, 'La unidad de medida es requerida'),
  stock_actual: z.coerce.number().min(0, 'El stock actual debe ser mayor o igual a 0'),
  stock_minimo: z.coerce.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  costo_unitario: z.coerce.number().min(0, 'El costo unitario debe ser mayor o igual a 0'),
})

export const categoriaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
})
