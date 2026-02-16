import { z } from 'zod'

export const productoSchema = z.object({
  nombre: z.string().min(2),
  precio: z.coerce.number().min(0)
})

export const insumoSchema = z.object({
  nombre: z.string().min(2),
  stock: z.coerce.number().min(0)
})
