import { createClient } from '@/utils/supabase/server'
import PosBoard from '../pos-board'

type Mesa = { id: number; nombre: string; posicion_x: number | null; posicion_y: number | null }
type Producto = { id: number; nombre: string; precio: number }

type Perfil = { restaurante_id: number | null }

export default async function PosPage() {
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

  const { data: mesas } = await supabase
    .from('mesas')
    .select('id, nombre, posicion_x, posicion_y')
    .eq('restaurante_id', restauranteId)
    .order('nombre')

  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, precio')
    .eq('restaurante_id', restauranteId)
    .order('nombre')

  return <PosBoard mesas={(mesas ?? []) as Mesa[]} productos={(productos ?? []) as Producto[]} />
}
