"use client"

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'
import { markOrderReady } from './actions'

type Orden = {
  id: number
  mesa_id: number | null
  estado: string
  created_at: string
  mesa_nombre: string | null
}

type Props = {
  restauranteId: number
  initialOrdenes: Orden[]
}

export default function KdsBoard({ restauranteId, initialOrdenes }: Props) {
  const [ordenes, setOrdenes] = useState(initialOrdenes)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('kds-ordenes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ordenes',
          filter: `restaurante_id=eq.${restauranteId}`,
        },
        async () => {
          const { data } = await supabase
            .from('ordenes')
            .select('id, mesa_id, estado, created_at')
            .eq('restaurante_id', restauranteId)
            .neq('estado', 'lista')
            .order('created_at', { ascending: true })

          const mesaIds = (data ?? []).map((orden) => orden.mesa_id).filter(Boolean) as number[]
          const { data: mesas } = await supabase
            .from('mesas')
            .select('id, nombre')
            .in('id', mesaIds.length ? mesaIds : [-1])

          const mesaMap = new Map((mesas ?? []).map((mesa) => [mesa.id, mesa.nombre]))
          const nextOrdenes = (data ?? []).map((orden) => ({
            ...orden,
            mesa_nombre: orden.mesa_id ? mesaMap.get(orden.mesa_id) ?? null : null,
          }))

          setOrdenes(nextOrdenes)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restauranteId])

  const handleReady = (ordenId: number) => {
    startTransition(async () => {
      setOrdenes((prev) => prev.filter((orden) => orden.id !== ordenId))
      await markOrderReady(ordenId)
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6 text-white">
      <h1 className="text-2xl font-bold">Kitchen Display System</h1>
      {ordenes.length === 0 ? (
        <p className="text-zinc-400">No hay pedidos pendientes.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ordenes.map((orden) => (
            <div key={orden.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold">Orden #{orden.id}</div>
                <div className="text-sm text-zinc-400">
                  {orden.mesa_nombre ? `Mesa ${orden.mesa_nombre}` : 'Para llevar'}
                </div>
              </div>
              <div className="text-sm text-zinc-500 mb-4">Estado: {orden.estado}</div>
              <button
                onClick={() => handleReady(orden.id)}
                disabled={isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg disabled:opacity-50"
              >
                Marcar como listo
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
