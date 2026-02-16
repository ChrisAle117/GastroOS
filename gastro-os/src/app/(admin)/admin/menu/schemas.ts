import { z } from 'zod'

export const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  precio: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  categoria: z.string().optional(),
  descripcion: z.string().optional(),
  disponible: z.boolean().default(true),
  es_critico: z.boolean().default(false), // Si algún ingrediente crítico falta, ocultar del menú
})

export const recetaItemSchema = z.object({
  insumo_id: z.number(),
  cantidad: z.coerce.number().min(0.001, 'La cantidad debe ser mayor a 0'),
  es_critico: z.boolean().default(false), // Si es crítico y falta, el platillo no está disponible
})

export const categoriaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
})

