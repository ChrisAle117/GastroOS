"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function getRestauranteId() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) return null

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('restaurante_id')
    .eq('id', user.id)
    .single()

  return perfil?.restaurante_id ?? null
}

// ============ PRODUCTOS ============
export async function getProductos() {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) return []

  const { data } = await supabase
    .from('productos')
    .select('*')
    .eq('restaurante_id', restaurante_id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getProductoWithCosto(id: string) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) return null

  const { data: producto } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)
    .single()

  if (!producto) return null

  // Calcular costo basado en receta
  const costo = await calcularCostoProducto(id)

  return {
    ...producto,
    costo_ingredientes: costo,
    margen: producto.precio - costo,
    margen_porcentaje: producto.precio > 0 ? ((producto.precio - costo) / producto.precio) * 100 : 0
  }
}

export async function createProducto(data: any) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
 
  const { data: producto, error } = await supabase
    .from('productos')
    .insert({ ...data, restaurante_id, disponible: true })
    .select('*')
    .single()
 
  if (error) throw error
  revalidatePath('/admin/menu')
  return producto
}

export async function updateProducto(id: string, data: any) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
  
  const { error } = await supabase
    .from('productos')
    .update(data)
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)
  
  if (error) throw error
  revalidatePath('/admin/menu')
}

export async function deleteProducto(id: string) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
  
  // Primero eliminar la receta asociada
  await supabase
    .from('recetas')
    .delete()
    .eq('producto_id', id)
    .eq('restaurante_id', restaurante_id)
  
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)
  
  if (error) throw error
  revalidatePath('/admin/menu')
}

// ============ RECETAS (ESCANDALLO) ============
export async function getReceta(producto_id: string) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) return []

  const { data } = await supabase
    .from('recetas')
    .select(`
      id,
      cantidad,
      es_critico,
      insumo:insumos(id, nombre, unidad_medida, costo_unitario, stock_actual)
    `)
    .eq('producto_id', producto_id)
    .eq('restaurante_id', restaurante_id)

  return data || []
}

export async function saveReceta(producto_id: string, items: { insumo_id: number, cantidad: number, es_critico: boolean }[]) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  // Eliminar receta anterior
  await supabase
    .from('recetas')
    .delete()
    .eq('producto_id', producto_id)
    .eq('restaurante_id', restaurante_id)

  // Insertar nuevos items
  if (items.length > 0) {
    const recetaItems = items.map(item => ({
      producto_id,
      insumo_id: item.insumo_id,
      cantidad: item.cantidad,
      es_critico: item.es_critico,
      restaurante_id
    }))

    const { error } = await supabase
      .from('recetas')
      .insert(recetaItems)

    if (error) throw error
  }

  revalidatePath('/admin/menu')
}

export async function calcularCostoProducto(producto_id: string): Promise<number> {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) return 0

  const { data: receta } = await supabase
    .from('recetas')
    .select(`
      cantidad,
      insumo:insumos(costo_unitario)
    `)
    .eq('producto_id', producto_id)
    .eq('restaurante_id', restaurante_id)

  if (!receta || receta.length === 0) return 0

  const costo = receta.reduce((total, item: any) => {
    const costoInsumo = item.insumo?.costo_unitario || 0
    return total + (item.cantidad * costoInsumo)
  }, 0)

  return costo
}

// ============ INSUMOS (para selección) ============
export async function getInsumos() {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) return []

  const { data } = await supabase
    .from('insumos')
    .select('*')
    .eq('restaurante_id', restaurante_id)
    .order('nombre', { ascending: true })

  return data || []
}

