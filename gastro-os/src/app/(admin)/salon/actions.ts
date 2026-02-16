"use server"

import { createClient } from '@/utils/supabase/server'

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

export async function createMesa(data: any) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
  const posicion_x = typeof data?.posicion_x === 'number' ? data.posicion_x : 0
  const posicion_y = typeof data?.posicion_y === 'number' ? data.posicion_y : 0
  await supabase.from('mesas').insert({ ...data, posicion_x, posicion_y, restaurante_id })
}

export async function updateMesaPosition(id: number, x: number, y: number) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')
  await supabase.from('mesas').update({ posicion_x: x, posicion_y: y }).eq('id', id).eq('restaurante_id', restaurante_id)
}
