import { createClient } from '@/utils/supabase/server'
import PosBoard from '../pos-board'
import { redirect } from 'next/navigation'

export default async function PosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('restaurante_id')
    .eq('id', user.id)
    .single()

  if (!perfil?.restaurante_id) redirect('/onboarding')

  const restauranteId = perfil.restaurante_id

  // Get salon floors
  const { data: floors } = await supabase
    .from('salon_floors')
    .select('*')
    .eq('restaurante_id', restauranteId)
    .order('orden')

  // Get mesas with full design data
  const { data: mesas } = await supabase
    .from('mesas')
    .select('id, nombre, posicion_x, posicion_y, estado, capacidad, width, height, shape, grupo_id, salon_floor_id')
    .eq('restaurante_id', restauranteId)
    .order('nombre')

  // Get productos with categories
  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, precio, categoria_id')
    .eq('restaurante_id', restauranteId)
    .order('nombre')

  // Get categories
  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre, orden')
    .eq('restaurante_id', restauranteId)
    .order('orden')

  // Get active orders
  const { data: ordenes } = await supabase
    .from('ordenes')
    .select('id, mesa_id, estado, total, created_at')
    .eq('restaurante_id', restauranteId)
    .eq('estado', 'abierta')

  return (
    <PosBoard
      floors={floors ?? []}
      mesas={mesas ?? []}
      productos={productos ?? []}
      categorias={categorias ?? []}
      ordenesActivas={ordenes ?? []}
    />
  )
}
