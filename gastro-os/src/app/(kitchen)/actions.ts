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

export async function markOrderReady(ordenId: number) {
  const supabase = await createClient()
  const restauranteId = await getRestauranteId()
  if (!restauranteId) throw new Error('No restaurante_id')

  const { error } = await supabase
    .from('ordenes')
    .update({ estado: 'lista' })
    .eq('id', ordenId)
    .eq('restaurante_id', restauranteId)

  if (error) throw new Error('No se pudo marcar la orden como lista')
}
