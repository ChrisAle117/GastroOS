"use client"

import { useState, useTransition } from 'react'
import { deleteMesa, cambiarEstadoMesa } from './actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Grid3x3, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Mesa {
  id: string
  nombre: string
  capacidad: number
  estado: 'libre' | 'ocupada' | 'sucia'
  posicion_x: number
  posicion_y: number
  created_at: string
}

interface MesasTableProps {
  mesas: Mesa[]
}

export default function MesasTable({ mesas }: MesasTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta mesa?')) return
    
    setDeletingId(id)
    startTransition(async () => {
      try {
        await deleteMesa(id)
      } catch (error) {
        alert('Error al eliminar la mesa')
      } finally {
        setDeletingId(null)
      }
    })
  }

  const handleCambiarEstado = (id: string, estado: 'libre' | 'ocupada' | 'sucia') => {
    startTransition(async () => {
      try {
        await cambiarEstadoMesa(id, estado)
      } catch (error) {
        alert('Error al cambiar el estado')
      }
    })
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'libre':
        return <Badge variant="success">Libre</Badge>
      case 'ocupada':
        return <Badge variant="destructive">Ocupada</Badge>
      case 'sucia':
        return <Badge variant="warning">Sucia</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  if (mesas.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <Grid3x3 className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-zinc-400">No hay mesas registradas</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left p-4 text-sm font-semibold text-zinc-300">Mesa</th>
              <th className="text-center p-4 text-sm font-semibold text-zinc-300">Capacidad</th>
              <th className="text-center p-4 text-sm font-semibold text-zinc-300">Posición</th>
              <th className="text-center p-4 text-sm font-semibold text-zinc-300">Estado</th>
              <th className="text-center p-4 text-sm font-semibold text-zinc-300">Cambiar Estado</th>
              <th className="text-center p-4 text-sm font-semibold text-zinc-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mesas.map((mesa) => (
              <tr
                key={mesa.id}
                className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Grid3x3 className="w-4 h-4 text-zinc-500" />
                    <span className="font-medium">{mesa.nombre}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-zinc-500" />
                    <span>{mesa.capacidad}</span>
                  </div>
                </td>
                <td className="p-4 text-center font-mono text-sm text-zinc-400">
                  ({mesa.posicion_x}, {mesa.posicion_y})
                </td>
                <td className="p-4 text-center">
                  {getEstadoBadge(mesa.estado)}
                </td>
                <td className="p-4 text-center">
                  <div className="flex gap-1 justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCambiarEstado(mesa.id, 'libre')}
                      disabled={isPending || mesa.estado === 'libre'}
                      className="text-xs"
                    >
                      Liberar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCambiarEstado(mesa.id, 'sucia')}
                      disabled={isPending || mesa.estado === 'sucia'}
                      className="text-xs"
                    >
                      Marcar Sucia
                    </Button>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(mesa.id)}
                    disabled={deletingId === mesa.id}
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
            <span className="text-zinc-400">Total mesas:</span>{' '}
            <span className="font-semibold">{mesas.length}</span>
          </div>
          <div>
            <span className="text-zinc-400">Libres:</span>{' '}
            <span className="font-semibold text-green-500">
              {mesas.filter(m => m.estado === 'libre').length}
            </span>
          </div>
          <div>
            <span className="text-zinc-400">Ocupadas:</span>{' '}
            <span className="font-semibold text-red-500">
              {mesas.filter(m => m.estado === 'ocupada').length}
            </span>
          </div>
          <div>
            <span className="text-zinc-400">Sucias:</span>{' '}
            <span className="font-semibold text-yellow-500">
              {mesas.filter(m => m.estado === 'sucia').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
