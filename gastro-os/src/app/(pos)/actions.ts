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

export async function createOrder(mesaId: number) {
  const supabase = await createClient()
  const restauranteId = await getRestauranteId()
  if (!restauranteId) throw new Error('No restaurante_id')

  const { data, error } = await supabase
    .from('ordenes')
    .insert({ restaurante_id: restauranteId, mesa_id: mesaId, estado: 'abierta' })
    .select('id')
    .single()

  if (error || !data) throw new Error('No se pudo crear la orden')
  return data.id as number
}

export async function addOrderItem(orderId: number, productoId: number, cantidad: number, precio: number) {
  const supabase = await createClient()
  const restauranteId = await getRestauranteId()
  if (!restauranteId) throw new Error('No restaurante_id')

  const { error } = await supabase.from('orden_items').insert({
    restaurante_id: restauranteId,
    orden_id: orderId,
    producto_id: productoId,
    cantidad,
    precio_unitario: precio,
  })

  if (error) throw new Error('No se pudo agregar el item')
}
