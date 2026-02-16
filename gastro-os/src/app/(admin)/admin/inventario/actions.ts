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

export async function createInsumo(data: any) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase.from('insumos').insert({
    restaurante_id,
    nombre: data.nombre,
    unidad_medida: data.unidad_medida,
    stock_actual: data.stock_actual,
    stock_minimo: data.stock_minimo,
    costo_unitario: data.costo_unitario,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/inventario')
}

export async function updateInsumo(id: number, data: any) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase
    .from('insumos')
    .update({
      nombre: data.nombre,
      unidad_medida: data.unidad_medida,
      stock_actual: data.stock_actual,
      stock_minimo: data.stock_minimo,
      costo_unitario: data.costo_unitario,
    })
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/inventario')
}

export async function deleteInsumo(id: number) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase
    .from('insumos')
    .delete()
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/inventario')
}

export async function updateStock(id: number, cantidad: number) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase
    .from('insumos')
    .update({ stock_actual: cantidad })
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/inventario')
}
