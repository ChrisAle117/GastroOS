import { createClient } from '@/utils/supabase/server'
import KdsBoard from '../kds-board'

type Perfil = { restaurante_id: number | null }

type Orden = {
  id: number
  mesa_id: number | null
  estado: string
  created_at: string
}

type Mesa = { id: number; nombre: string }

type OrderView = Orden & { mesa_nombre: string | null }

export default async function KitchenPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    return <div className="p-6 text-white">Debes iniciar sesion.</div>
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('restaurante_id')
    .eq('id', user.id)
    .single<Perfil>()

  const restauranteId = perfil?.restaurante_id

  if (!restauranteId) {
    return <div className="p-6 text-white">No hay restaurante asociado.</div>
  }

  const { data: ordenes } = await supabase
    .from('ordenes')
    .select('id, mesa_id, estado, created_at')
    .eq('restaurante_id', restauranteId)
    .neq('estado', 'lista')
    .order('created_at', { ascending: true })

  const mesaIds = (ordenes ?? []).map((orden) => orden.mesa_id).filter(Boolean) as number[]

  const { data: mesas } = await supabase
    .from('mesas')
    .select('id, nombre')
    .in('id', mesaIds.length ? mesaIds : [-1])

  const mesaMap = new Map((mesas ?? []).map((mesa) => [mesa.id, mesa.nombre]))

  const ordenesView: OrderView[] = (ordenes ?? []).map((orden) => ({
    ...orden,
    mesa_nombre: orden.mesa_id ? mesaMap.get(orden.mesa_id) ?? null : null,
  }))

  return (
    <KdsBoard
      restauranteId={restauranteId}
      initialOrdenes={ordenesView}
    />
  )
}
