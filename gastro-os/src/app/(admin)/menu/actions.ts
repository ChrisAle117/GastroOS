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

export async function createProducto(data: any) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
  
  const { error } = await supabase
    .from('productos')
    .insert({ ...data, restaurante_id })
  
  if (error) throw error
  revalidatePath('/admin/menu')
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
  
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)
  
  if (error) throw error
  revalidatePath('/admin/menu')
}

// ============ INSUMOS ============
export async function getInsumos() {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) return []

  const { data } = await supabase
    .from('insumos')
    .select('*')
    .eq('restaurante_id', restaurante_id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function createInsumo(data: any) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
  
  const { error } = await supabase
    .from('insumos')
    .insert({ ...data, restaurante_id })
  
  if (error) throw error
  revalidatePath('/admin/menu')
}

export async function updateInsumo(id: string, data: any) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
  
  const { error } = await supabase
    .from('insumos')
    .update(data)
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)
  
  if (error) throw error
  revalidatePath('/admin/menu')
}

export async function deleteInsumo(id: string) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
  
  const { error } = await supabase
    .from('insumos')
    .delete()
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)
  
  if (error) throw error
  revalidatePath('/admin/menu')
}

// ============ MERMAS (Waste Tracking) ============
export async function registrarMerma(insumo_id: string, cantidad: number, motivo: string) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
  
  // 1. Get current insumo stock
  const { data: insumo } = await supabase
    .from('insumos')
    .select('stock_actual, costo_unitario')
    .eq('id', insumo_id)
    .eq('restaurante_id', restaurante_id)
    .single()
  
  if (!insumo) throw new Error('Insumo no encontrado')
  
  // 2. Calculate waste cost and update stock
  const costo_total = cantidad * (insumo.costo_unitario || 0)
  const nuevo_stock = Math.max(0, insumo.stock_actual - cantidad)
  
  // 3. Update stock
  await supabase
    .from('insumos')
    .update({ stock_actual: nuevo_stock })
    .eq('id', insumo_id)
    .eq('restaurante_id', restaurante_id)
  
  // 4. Record waste in mermas table
  await supabase
    .from('mermas')
    .insert({
      restaurante_id,
      insumo_id,
      cantidad,
      costo: costo_total,
      motivo,
    })
  
  revalidatePath('/admin/menu')
  revalidatePath('/admin/finanzas')
}
