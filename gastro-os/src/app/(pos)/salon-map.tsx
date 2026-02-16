"use client"

import { useMemo } from 'react'
import { Clock } from 'lucide-react'

type Mesa = {
  id: string
  nombre: string
  posicion_x: number
  posicion_y: number
  estado: 'libre' | 'ocupada' | 'sucia'
  capacidad: number
  width?: number | null
  height?: number | null
  shape?: 'rect' | 'round' | 'bar' | null
}

type OrdenActiva = {
  id: number
  mesa_id: string
  created_at: string
}

type Props = {
  mesas: Mesa[]
  canvasWidth: number
  canvasHeight: number
  onMesaClick: (mesa: Mesa) => void
  ordenesActivas: OrdenActiva[]
}

const DEFAULT_SIZE = 72

export default function SalonMap({ mesas, canvasWidth, canvasHeight, onMesaClick, ordenesActivas }: Props) {
  const estadoColor = useMemo(() => ({
    libre: 'bg-emerald-500/90 border-emerald-400 hover:bg-emerald-600',
    ocupada: 'bg-red-500/90 border-red-400 hover:bg-red-600',
    sucia: 'bg-amber-500/90 border-amber-400 hover:bg-amber-600',
  }), [])

  const shapeClass = useMemo(() => ({
    rect: 'rounded-2xl',
    round: 'rounded-full',
    bar: 'rounded-xl',
  }), [])

  const getMesaLayout = (mesa: Mesa) => ({
    width: mesa.width ?? DEFAULT_SIZE,
    height: mesa.height ?? DEFAULT_SIZE,
    shape: mesa.shape ?? 'rect',
  })

  const getOrdenActivaParaMesa = (mesaId: string) => {
    return ordenesActivas.find((orden) => orden.mesa_id === mesaId)
  }

  const getTimeSinceOrder = (ordenTime: string) => {
    const diff = Date.now() - new Date(ordenTime).getTime()
    const minutes = Math.floor(diff / 60000)
    return minutes
  }

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="relative">
        <div
          className="relative bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:24px_24px] rounded-lg border border-zinc-800"
          style={{ width: canvasWidth, height: canvasHeight }}
        >
          {mesas.map((mesa) => {
            const layout = getMesaLayout(mesa)
            const ordenActiva = getOrdenActivaParaMesa(mesa.id)
            const minutosActiva = ordenActiva ? getTimeSinceOrder(ordenActiva.created_at) : 0

            return (
              <button
                key={mesa.id}
                onClick={() => onMesaClick(mesa)}
                className={`absolute flex flex-col items-center justify-center text-center text-white border-2 shadow-lg cursor-pointer select-none transition-all hover:scale-105 ${estadoColor[mesa.estado]} ${shapeClass[layout.shape]}`}
                style={{
                  width: layout.width,
                  height: layout.height,
                  left: mesa.posicion_x,
                  top: mesa.posicion_y,
                }}
              >
                <div className="text-sm font-bold">{mesa.nombre}</div>
                <span className="text-[10px] uppercase tracking-wider opacity-80">{mesa.estado}</span>
                <span className="text-[10px] opacity-70">{mesa.capacidad} pax</span>
                
                {ordenActiva && minutosActiva > 0 && (
                  <div className="absolute -top-2 -right-2 bg-zinc-900 border border-white rounded-full px-1.5 py-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{minutosActiva}m</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
