"use client"

import { useState, useTransition } from 'react'
import { deleteInsumo, registrarMerma } from './actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Insumo {
  id: string
  nombre: string
  unidad_medida: string
  stock_actual: number
  stock_minimo: number
  costo_unitario: number
  created_at: string
}

interface InsumosTableProps {
  insumos: Insumo[]
}

export default function InsumosTable({ insumos }: InsumosTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este insumo?')) return
    
    setDeletingId(id)
    startTransition(async () => {
      try {
        await deleteInsumo(id)
      } catch (error) {
        alert('Error al eliminar el insumo')
      } finally {
        setDeletingId(null)
      }
    })
  }

  const isLowStock = (insumo: Insumo) => insumo.stock_actual <= insumo.stock_minimo

  if (insumos.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-zinc-400">No hay insumos registrados</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left p-4 text-sm font-semibold text-zinc-300">Insumo</th>
              <th className="text-right p-4 text-sm font-semibold text-zinc-300">Stock</th>
              <th className="text-right p-4 text-sm font-semibold text-zinc-300">Stock Mín</th>
              <th className="text-right p-4 text-sm font-semibold text-zinc-300">Costo</th>
              <th className="text-right p-4 text-sm font-semibold text-zinc-300">Valor Total</th>
              <th className="text-center p-4 text-sm font-semibold text-zinc-300">Estado</th>
              <th className="text-center p-4 text-sm font-semibold text-zinc-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((insumo) => (
              <tr
                key={insumo.id}
                className={cn(
                  "border-b border-zinc-800 transition-colors hover:bg-zinc-800/50",
                  isLowStock(insumo) && "bg-red-950/20"
                )}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {isLowStock(insumo) && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{insumo.nombre}</div>
                      <div className="text-sm text-zinc-500">{insumo.unidad_medida}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className={cn(
                    "font-mono",
                    isLowStock(insumo) && "text-red-500 font-semibold"
                  )}>
                    {insumo.stock_actual.toFixed(2)}
                  </span>
                </td>
                <td className="p-4 text-right text-zinc-400 font-mono">
                  {insumo.stock_minimo.toFixed(2)}
                </td>
                <td className="p-4 text-right font-mono">
                  ${insumo.costo_unitario.toFixed(2)}
                </td>
                <td className="p-4 text-right font-mono font-semibold">
                  ${(insumo.stock_actual * insumo.costo_unitario).toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  {isLowStock(insumo) ? (
                    <Badge variant="destructive">Stock Bajo</Badge>
                  ) : (
                    <Badge variant="success">OK</Badge>
                  )}
                </td>
                <td className="p-4 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(insumo.id)}
                    disabled={deletingId === insumo.id}
                    className="text-red-500 hover:text-red-400 hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary */}
      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-between items-center">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-zinc-400">Total insumos:</span>{' '}
            <span className="font-semibold">{insumos.length}</span>
          </div>
          <div>
            <span className="text-zinc-400">Stock bajo:</span>{' '}
            <span className="font-semibold text-red-500">
              {insumos.filter(isLowStock).length}
            </span>
          </div>
          <div>
            <span className="text-zinc-400">Valor total:</span>{' '}
            <span className="font-semibold">
              ${insumos.reduce((sum, i) => sum + (i.stock_actual * i.costo_unitario), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
