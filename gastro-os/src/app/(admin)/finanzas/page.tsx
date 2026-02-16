import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { getInsumos } from '../menu/actions'

type Perfil = { restaurante_id: number | null }

type Pago = {
  subtotal: number
  propina: number
  metodo: string
  created_at: string
}

type Merma = {
  costo: number
  motivo: string
  created_at: string
}

export default async function FinanzasPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    return <div className="p-6 text-white">Debes iniciar sesión.</div>
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
    .select('costo, motivo, created_at')
    .eq('restaurante_id', restauranteId)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .order('created_at', { ascending: false })

  // Get insumos for inventory alerts
  const insumos = await getInsumos()
  const insumosConStockBajo = insumos.filter(i => i.stock_actual <= i.stock_minimo)

  const pagosList = (pagos ?? []) as Pago[]
  const mermasList = (mermas ?? []) as Merma[]

  const ventas = pagosList.reduce((sum, pago) => sum + (pago.subtotal ?? 0), 0)
  const propinas = pagosList.reduce((sum, pago) => sum + (pago.propina ?? 0), 0)
  const totalMermas = mermasList.reduce((sum, merma) => sum + (merma.costo ?? 0), 0)
  const netoDia = ventas + propinas - totalMermas

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Finanzas</h2>
        <p className="text-zinc-400">Resumen financiero del día</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Ventas del Día</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${ventas.toFixed(2)}</div>
            <p className="text-xs text-zinc-500 mt-1">{pagosList.length} transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Propinas</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">${propinas.toFixed(2)}</div>
            <p className="text-xs text-zinc-500 mt-1">
              {ventas > 0 ? ((propinas / ventas) * 100).toFixed(1) : 0}% de ventas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Mermas del Día</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">${totalMermas.toFixed(2)}</div>
            <p className="text-xs text-zinc-500 mt-1">{mermasList.length} registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Neto del Día</CardTitle>
            <DollarSign className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">${netoDia.toFixed(2)}</div>
            <p className="text-xs text-zinc-500 mt-1">Ventas - Mermas</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      {insumosConStockBajo.length > 0 && (
        <Card className="border-red-900/50 bg-red-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <CardTitle className="text-red-500">Alertas de Inventario</CardTitle>
            </div>
            <CardDescription>
              {insumosConStockBajo.length} insumo(s) con stock bajo o crítico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insumosConStockBajo.slice(0, 5).map((insumo) => (
                <div key={insumo.id} className="flex justify-between items-center text-sm">
                  <span className="text-zinc-300">{insumo.nombre}</span>
                  <span className="text-red-500 font-mono">
                    {insumo.stock_actual.toFixed(2)} / {insumo.stock_minimo.toFixed(2)} {insumo.unidad_medida}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Mermas */}
      {mermasList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mermas Registradas Hoy</CardTitle>
            <CardDescription>Últimos registros de desperdicio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mermasList.map((merma, index) => (
                <div key={index} className="flex justify-between items-center pb-3 border-b border-zinc-800 last:border-0">
                  <div>
                    <div className="font-medium">{merma.motivo}</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(merma.created_at).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-red-500 font-mono font-semibold">
                    ${merma.costo.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
