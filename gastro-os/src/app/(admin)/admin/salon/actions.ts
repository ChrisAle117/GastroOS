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

export async function getMesas() {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) return []

  const { data } = await supabase
    .from('mesas')
    .select('*')
    .eq('restaurante_id', restaurante_id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function createMesa(data: any) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  const posicion_x = typeof data?.posicion_x === 'number' ? data.posicion_x : 0
  const posicion_y = typeof data?.posicion_y === 'number' ? data.posicion_y : 0
  const capacidad = data?.capacidad || 4
  const estado = 'libre'
  const baseSize = Math.max(72, 56 + capacidad * 4)

  const { error } = await supabase
    .from('mesas')
    .insert({ 
      ...data, 
      posicion_x, 
      posicion_y, 
      capacidad,
      width: data?.width ?? baseSize,
      height: data?.height ?? baseSize,
      shape: data?.shape ?? 'rect',
      grupo_id: data?.grupo_id ?? null,
      salon_floor_id: data?.salon_floor_id ?? null,
      estado,
      restaurante_id 
    })
  
  if (error) throw error
  revalidatePath('/admin/salon')
  revalidatePath('/pos')
}

export async function updateMesaPosition(id: string, x: number, y: number) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase
    .from('mesas')
    .update({ posicion_x: x, posicion_y: y })
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)
  
  if (error) throw error
  revalidatePath('/admin/salon')
}

export async function updateMesaLayout(id: string, data: { posicion_x?: number; posicion_y?: number; width?: number; height?: number; shape?: string; grupo_id?: string | null; salon_floor_id?: string | null }) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase
    .from('mesas')
    .update(data)
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)

  if (error) throw error
  revalidatePath('/admin/salon')
}

export async function updateMesasLayoutBulk(updates: { id: string; posicion_x: number; posicion_y: number }[]) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  for (const update of updates) {
    const { error } = await supabase
      .from('mesas')
      .update({ posicion_x: update.posicion_x, posicion_y: update.posicion_y })
      .eq('id', update.id)
      .eq('restaurante_id', restaurante_id)

    if (error) throw error
  }

  revalidatePath('/admin/salon')
}

export async function updateMesaDetails(id: string, data: { nombre?: string; capacidad?: number; width?: number; height?: number; shape?: string; salon_floor_id?: string | null }) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase
    .from('mesas')
    .update(data)
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)

  if (error) throw error
  revalidatePath('/admin/salon')
  revalidatePath('/pos')
}

export async function updateMesasGroup(ids: string[], groupId: string | null) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  for (const id of ids) {
    const { error } = await supabase
      .from('mesas')
      .update({ grupo_id: groupId })
      .eq('id', id)
      .eq('restaurante_id', restaurante_id)

    if (error) throw error
  }

  revalidatePath('/admin/salon')
}

export async function getSalonLabels() {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) return []

  const { data } = await supabase
    .from('salon_labels')
    .select('*')
    .eq('restaurante_id', restaurante_id)
    .order('created_at', { ascending: true })

  return data || []
}

export async function createSalonLabel(data: { nombre: string; x: number; y: number; salon_floor_id?: string | null }) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { data: label, error } = await supabase
    .from('salon_labels')
    .insert({ ...data, restaurante_id })
    .select('*')
    .single()

  if (error) throw error
  revalidatePath('/admin/salon')
  return label
}

export async function updateSalonLabel(id: string, data: { nombre?: string; x?: number; y?: number }) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase
    .from('salon_labels')
    .update(data)
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)

  if (error) throw error
  revalidatePath('/admin/salon')
}

export async function deleteSalonLabel(id: string) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase
    .from('salon_labels')
    .delete()
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)

  if (error) throw error
  revalidatePath('/admin/salon')
}

export async function getSalonFloors() {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) return []

  const { data: floors } = await supabase
    .from('salon_floors')
    .select('*')
    .eq('restaurante_id', restaurante_id)
    .order('orden', { ascending: true })

  if (floors && floors.length > 0) {
    return floors
  }

  const { data: floor, error } = await supabase
    .from('salon_floors')
    .insert({ restaurante_id, nombre: 'Principal', orden: 1, grid_width: 1200, grid_height: 800 })
    .select('*')
    .single()

  if (error) throw error
  return floor ? [floor] : []
}

export async function createSalonFloor(data: { nombre: string; grid_width?: number; grid_height?: number }) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { count } = await supabase
    .from('salon_floors')
    .select('id', { count: 'exact', head: true })
    .eq('restaurante_id', restaurante_id)

  const orden = (count ?? 0) + 1

  const { data: floor, error } = await supabase
    .from('salon_floors')
    .insert({
      restaurante_id,
      nombre: data.nombre,
      orden,
      grid_width: data.grid_width ?? 1200,
      grid_height: data.grid_height ?? 800,
    })
    .select('*')
    .single()

  if (error) throw error
  revalidatePath('/admin/salon')
  return floor
}

export async function updateSalonFloor(id: string, data: { nombre?: string; grid_width?: number; grid_height?: number }) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase
    .from('salon_floors')
    .update(data)
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)

  if (error) throw error
  revalidatePath('/admin/salon')
}

export async function deleteSalonFloor(id: string) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase
    .from('salon_floors')
    .delete()
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)

  if (error) throw error
  revalidatePath('/admin/salon')
}

export async function cambiarEstadoMesa(id: string, nuevoEstado: 'libre' | 'ocupada' | 'sucia') {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
  
  const { error } = await supabase
    .from('mesas')
    .update({ estado: nuevoEstado })
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)
  
  if (error) throw error
  revalidatePath('/admin/salon')
  revalidatePath('/pos')
  revalidatePath('/kitchen')
}

export async function deleteMesa(id: string) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
  
  const { error } = await supabase
    .from('mesas')
    .delete()
    .eq('id', id)
    .eq('restaurante_id', restaurante_id)
  
  if (error) throw error
  revalidatePath('/admin/salon')
}
