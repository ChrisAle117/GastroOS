import { z } from 'zod'

export const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  precio: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  categoria_id: z.coerce.number().optional().nullable(),
  descripcion: z.string().optional(),
  imagen_url: z.string().url().optional().or(z.literal('')),
  disponible: z.boolean().default(true),
})

export const recetaItemSchema = z.object({
  insumo_id: z.number(),
  cantidad: z.coerce.number().min(0.001, 'La cantidad debe ser mayor a 0'),
  es_critico: z.boolean().default(false), // Si es crítico y falta, el platillo no está disponible
})

export const categoriaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  icono: z.string().optional(),
  color: z.string().optional(),
  orden: z.coerce.number().default(0),
  activo: z.boolean().default(true),
})

export const modificadorSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  tipo: z.enum(['extra', 'exclusion']),
  precio: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0').default(0),
  descripcion: z.string().optional(),
  disponible: z.boolean().default(true),
})

