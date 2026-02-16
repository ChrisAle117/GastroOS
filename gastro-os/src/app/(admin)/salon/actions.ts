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
  
  const { error } = await supabase
    .from('mesas')
    .insert({ 
      ...data, 
      posicion_x, 
      posicion_y, 
      capacidad,
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
