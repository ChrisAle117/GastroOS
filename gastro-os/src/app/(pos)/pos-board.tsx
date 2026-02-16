"use client"

import { useState } from 'react'
import { ShoppingCart, Users } from 'lucide-react'
import SalonMap from './salon-map'
import ComanderoModal from './comandero-modal'

type Floor = {
  id: string
  nombre: string
  grid_width: number
  grid_height: number
}

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
  grupo_id?: string | null
  salon_floor_id?: string | null
}

type Producto = {
  id: number
  nombre: string
  precio: number
  categoria_id?: number | null
}

type Categoria = {
  id: number
  nombre: string
  orden: number
}

type OrdenActiva = {
  id: number
  mesa_id: string
  estado: string
  total?: number | null
  created_at: string
}

type Props = {
  floors: Floor[]
  mesas: Mesa[]
  productos: Producto[]
  categorias: Categoria[]
  ordenesActivas: OrdenActiva[]
}

export default function PosBoard({ floors, mesas, productos, categorias, ordenesActivas }: Props) {
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(floors[0]?.id ?? null)
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null)
  const [showComandero, setShowComandero] = useState(false)

  const selectedFloor = floors.find((f) => f.id === selectedFloorId) ?? floors[0]

  const mesasFiltradas = mesas.filter((mesa) => {
    const fallbackFloorId = floors[0]?.id
    if (!mesa.salon_floor_id) return selectedFloorId === fallbackFloorId
    return mesa.salon_floor_id === selectedFloorId
  })

  const handleMesaClick = (mesa: Mesa) => {
    setSelectedMesa(mesa)
    setShowComandero(true)
  }

  const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada').length
  const totalMesas = mesas.length

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Header Stats */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-zinc-400">Mesas:</span>
              <span className="text-lg font-bold">{mesasOcupadas}/{totalMesas}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-zinc-400">Órdenes activas:</span>
              <span className="text-lg font-bold">{ordenesActivas.length}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Piso:</span>
            <select
              value={selectedFloorId ?? ''}
              onChange={(e) => setSelectedFloorId(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
            >
              {floors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Salon Map */}
      <div className="flex-1 overflow-auto p-6">
        {selectedFloor && (
          <SalonMap
            mesas={mesasFiltradas}
            canvasWidth={selectedFloor.grid_width}
            canvasHeight={selectedFloor.grid_height}
            onMesaClick={handleMesaClick}
            ordenesActivas={ordenesActivas}
          />
        )}
      </div>

      {/* Comandero Modal */}
      {showComandero && selectedMesa && (
        <ComanderoModal
          mesa={selectedMesa}
          productos={productos}
          categorias={categorias}
          onClose={() => {
            setShowComandero(false)
            setSelectedMesa(null)
          }}
        />
      )}
    </div>
  )
}
