"use client"

import { useState, useTransition } from 'react'
import { deleteProducto } from './actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, UtensilsCrossed } from 'lucide-react'

interface Producto {
  id: string
  nombre: string
  precio: number
  categoria?: string
  descripcion?: string
  created_at: string
}

interface ProductosTableProps {
  productos: Producto[]
}

export default function ProductosTable({ productos }: ProductosTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    
    setDeletingId(id)
    startTransition(async () => {
      try {
        await deleteProducto(id)
      } catch (error) {
        alert('Error al eliminar el producto')
      } finally {
        setDeletingId(null)
      }
    })
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-zinc-400">No hay productos registrados</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left p-4 text-sm font-semibold text-zinc-300">Producto</th>
              <th className="text-left p-4 text-sm font-semibold text-zinc-300">Categoría</th>
              <th className="text-right p-4 text-sm font-semibold text-zinc-300">Precio</th>
              <th className="text-center p-4 text-sm font-semibold text-zinc-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr
                key={producto.id}
                className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50"
              >
                <td className="p-4">
                  <div>
                    <div className="font-medium">{producto.nombre}</div>
                    {producto.descripcion && (
                      <div className="text-sm text-zinc-500">{producto.descripcion}</div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  {producto.categoria ? (
                    <Badge variant="secondary">{producto.categoria}</Badge>
                  ) : (
                    <span className="text-zinc-500 text-sm">Sin categoría</span>
                  )}
                </td>
                <td className="p-4 text-right font-mono font-semibold text-green-500">
                  ${producto.precio.toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(producto.id)}
                    disabled={deletingId === producto.id}
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
            <span className="text-zinc-400">Total productos:</span>{' '}
            <span className="font-semibold">{productos.length}</span>
          </div>
          <div>
            <span className="text-zinc-400">Precio promedio:</span>{' '}
            <span className="font-semibold">
              ${productos.length > 0 
                ? (productos.reduce((sum, p) => sum + p.precio, 0) / productos.length).toFixed(2)
                : '0.00'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
