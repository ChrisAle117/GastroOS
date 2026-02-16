import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import InsumoDialog from './insumo-dialog'
import EditInsumoDialog from './edit-insumo-dialog'
import DeleteInsumoDialog from './delete-insumo-dialog'
import AdjustStockDialog from './adjust-stock-dialog'
import { AlertCircle, Package, TrendingDown, DollarSign, TrendingUp, Edit, Plus, Trash2 } from 'lucide-react'

type Insumo = {
  id: number
  nombre: string
  unidad_medida: string
  stock_actual: number
  stock_minimo: number
  costo_unitario: number
}

export default async function InventarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('restaurante_id, nombre_completo')
    .eq('id', user.id)
    .single()

  if (!perfil?.restaurante_id) redirect('/onboarding')

  const { data: insumos } = await supabase
    .from('insumos')
    .select('id, nombre, unidad_medida, stock_actual, stock_minimo, costo_unitario')
    .eq('restaurante_id', perfil.restaurante_id)
    .order('nombre')

  const insumosList = (insumos ?? []) as Insumo[]
  const insumosConStockBajo = insumosList.filter(i => i.stock_actual <= i.stock_minimo)
  const valorTotalInventario = insumosList.reduce((sum, i) => sum + (i.stock_actual * i.costo_unitario), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-zinc-400">Gestiona los insumos de tu restaurante</p>
        </div>
        <InsumoDialog />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-2">
            <Package className="w-4 h-4" />
            Total de Insumos
          </div>
          <div className="text-3xl font-bold">{insumosList.length}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-2">
            <TrendingDown className="w-4 h-4" />
            Valor del Inventario
          </div>
          <div className="text-3xl font-bold">${valorTotalInventario.toFixed(2)}</div>
        </div>

        <div className={`border rounded-lg p-6 ${
          insumosConStockBajo.length > 0 
            ? 'bg-red-950 border-red-800' 
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <AlertCircle className={`w-4 h-4 ${insumosConStockBajo.length > 0 ? 'text-red-500' : 'text-zinc-400'}`} />
            <span className={insumosConStockBajo.length > 0 ? 'text-red-400' : 'text-zinc-400'}>
              Stock Bajo
            </span>
          </div>
          <div className={`text-3xl font-bold ${insumosConStockBajo.length > 0 ? 'text-red-500' : ''}`}>
            {insumosConStockBajo.length}
          </div>
        </div>
      </div>

      {/* Tabla de Insumos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800 border-b border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Insumo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Stock Mínimo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Costo Unit.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {insumosList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-zinc-400">
                    No hay insumos registrados. Agrega tu primer insumo para comenzar.
                  </td>
                </tr>
              ) : (
                insumosList.map((insumo) => {
                  const stockBajo = insumo.stock_actual <= insumo.stock_minimo
                  const valorTotal = insumo.stock_actual * insumo.costo_unitario

                  return (
                    <tr key={insumo.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {insumo.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                        {insumo.unidad_medida}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap font-semibold ${stockBajo ? 'text-red-500' : ''}`}>
                        {insumo.stock_actual}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                        {insumo.stock_minimo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                        ${insumo.costo_unitario.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        ${valorTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stockBajo ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-800">
                            <AlertCircle className="w-3 h-3" />
                            Stock Bajo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <EditInsumoDialog insumo={insumo} />
                          <AdjustStockDialog insumo={insumo} />
                          <DeleteInsumoDialog insumo={insumo} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
