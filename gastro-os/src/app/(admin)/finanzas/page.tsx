import { createClient } from '@/utils/supabase/server'
import MermaForm from './merma-form'

type Perfil = { restaurante_id: number | null }

type Pago = {
  subtotal: number
  propina: number
  metodo: string
  created_at: string
}

type Merma = {
  costo: number
  created_at: string
}

export default async function FinanzasPage() {
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

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const { data: pagos } = await supabase
    .from('pagos')
    .select('subtotal, propina, metodo, created_at')
    .eq('restaurante_id', restauranteId)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())

  const { data: mermas } = await supabase
    .from('mermas')
    .select('costo, created_at')
    .eq('restaurante_id', restauranteId)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())

  const pagosList = (pagos ?? []) as Pago[]
  const mermasList = (mermas ?? []) as Merma[]

  const ventas = pagosList.reduce((sum, pago) => sum + (pago.subtotal ?? 0), 0)
  const propinas = pagosList.reduce((sum, pago) => sum + (pago.propina ?? 0), 0)
  const totalMermas = mermasList.reduce((sum, merma) => sum + (merma.costo ?? 0), 0)

  return (
    <div className="flex flex-col gap-8 p-6 text-white">
      <h2 className="text-2xl font-bold">Finanzas y Mermas</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-sm text-zinc-400">Ventas del dia</div>
          <div className="text-2xl font-semibold">${ventas.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-sm text-zinc-400">Propinas del dia</div>
          <div className="text-2xl font-semibold">${propinas.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-sm text-zinc-400">Mermas del dia</div>
          <div className="text-2xl font-semibold">${totalMermas.toFixed(2)}</div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-lg font-semibold mb-4">Registrar merma</h3>
        <MermaForm />
      </div>
    </div>
  )
}
