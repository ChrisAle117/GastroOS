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

export async function createMerma(data: any) {
  const supabase = await createClient()
  const restaurante_id = await getRestauranteId()
  if (!restaurante_id) throw new Error('No restaurante_id')

  const { error } = await supabase.from('mermas').insert({
    restaurante_id,
    motivo: data.motivo,
    costo: data.costo,
  })

  if (error) throw new Error('No se pudo registrar la merma')
}
