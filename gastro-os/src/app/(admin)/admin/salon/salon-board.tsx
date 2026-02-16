"use client"

import { useEffect, useMemo, useState, useTransition } from 'react'
import MesasMap from './mesas-map'
import MesasTable from './mesas-table'
import MesaForm from './mesa-form'
import { createSalonFloor, deleteSalonFloor, updateSalonFloor } from './actions'

type Floor = {
  id: string
  nombre: string
  orden: number
  grid_width: number
  grid_height: number
}

type Mesa = {
  id: string
  nombre: string
  capacidad: number
  estado: 'libre' | 'ocupada' | 'sucia'
  posicion_x: number
  posicion_y: number
  width?: number | null
  height?: number | null
  shape?: 'rect' | 'round' | 'bar' | null
  grupo_id?: string | null
  salon_floor_id?: string | null
  created_at: string
}

type SalonLabel = {
  id: string
  nombre: string
  x: number
  y: number
  salon_floor_id?: string | null
}

type Props = {
  floors: Floor[]
  mesas: Mesa[]
  labels: SalonLabel[]
}

export default function SalonBoard({ floors, mesas, labels }: Props) {
  const [localFloors, setLocalFloors] = useState<Floor[]>(floors)
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(floors[0]?.id ?? null)
  const [floorName, setFloorName] = useState(floors[0]?.nombre ?? '')
  const [newFloorName, setNewFloorName] = useState('')
  const [gridWidth, setGridWidth] = useState<number>(floors[0]?.grid_width ?? 1200)
  const [gridHeight, setGridHeight] = useState<number>(floors[0]?.grid_height ?? 800)
  const [isPending, startTransition] = useTransition()

  const selectedFloor = useMemo(
    () => localFloors.find((floor) => floor.id === selectedFloorId) ?? localFloors[0],
    [localFloors, selectedFloorId]
  )

  const floorId = selectedFloor?.id ?? null

  useEffect(() => {
    if (!selectedFloor) return
    setFloorName(selectedFloor.nombre)
    setGridWidth(selectedFloor.grid_width)
    setGridHeight(selectedFloor.grid_height)
  }, [selectedFloor])

  const mesasFiltradas = useMemo(() => {
    if (!floorId) return []
    const fallbackFloorId = localFloors[0]?.id
    return mesas.filter((mesa) => {
      if (!mesa.salon_floor_id) return floorId === fallbackFloorId
      return mesa.salon_floor_id === floorId
    })
  }, [mesas, floorId, localFloors])

  const labelsFiltradas = useMemo(() => {
    if (!floorId) return []
    const fallbackFloorId = localFloors[0]?.id
    return labels.filter((label) => {
      if (!label.salon_floor_id) return floorId === fallbackFloorId
      return label.salon_floor_id === floorId
    })
  }, [labels, floorId, localFloors])

  const handleAddFloor = () => {
    const nombre = newFloorName.trim()
    if (!nombre) return

    startTransition(async () => {
      try {
        const floor = await createSalonFloor({ nombre })
        if (floor) {
          setLocalFloors((prev) => [...prev, floor])
          setSelectedFloorId(floor.id)
          setNewFloorName('')
          setGridWidth(floor.grid_width)
          setGridHeight(floor.grid_height)
        }
      } catch (error) {
        console.error('Error al crear piso', error)
      }
    })
  }

  const handleUpdateGrid = () => {
    if (!selectedFloor) return

    startTransition(async () => {
      try {
        await updateSalonFloor(selectedFloor.id, { grid_width: gridWidth, grid_height: gridHeight })
        setLocalFloors((prev) => prev.map((floor) => floor.id === selectedFloor.id
          ? { ...floor, grid_width: gridWidth, grid_height: gridHeight }
          : floor
        ))
      } catch (error) {
        console.error('Error al actualizar el tamano del plano', error)
      }
    })
  }

  const handleRenameFloor = () => {
    if (!selectedFloor) return
    const nombre = floorName.trim()
    if (!nombre) return

    startTransition(async () => {
      try {
        await updateSalonFloor(selectedFloor.id, { nombre })
        setLocalFloors((prev) => prev.map((floor) => floor.id === selectedFloor.id
          ? { ...floor, nombre }
          : floor
        ))
      } catch (error) {
        console.error('Error al renombrar piso', error)
      }
    })
  }

  const handleDeleteFloor = () => {
    if (!selectedFloor) return
    if (localFloors.length <= 1) return
    if (!confirm('Eliminar este piso? Las mesas quedaran sin piso asignado.')) return

    startTransition(async () => {
      try {
        await deleteSalonFloor(selectedFloor.id)
        const nextFloors = localFloors.filter((floor) => floor.id !== selectedFloor.id)
        setLocalFloors(nextFloors)
        setSelectedFloorId(nextFloors[0]?.id ?? null)
      } catch (error) {
        console.error('Error al eliminar piso', error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <input
              value={newFloorName}
              onChange={(event) => setNewFloorName(event.target.value)}
              placeholder="Nuevo piso"
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={handleAddFloor}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
            >
              Agregar piso
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <span>Nombre del piso:</span>
          <input
            value={floorName}
            onChange={(event) => setFloorName(event.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 w-48"
          />
          <button
            type="button"
            onClick={handleRenameFloor}
            disabled={isPending || !selectedFloor}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700"
          >
            Renombrar
          </button>
          <button
            type="button"
            onClick={handleDeleteFloor}
            disabled={isPending || !selectedFloor || localFloors.length <= 1}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-red-300"
          >
            Eliminar
          </button>
        </div>
      </div>

      <MesaForm floors={localFloors} selectedFloorId={floorId} />
      {selectedFloor && (
        <MesasMap
          mesas={mesasFiltradas}
          labels={labelsFiltradas}
          floors={localFloors}
          selectedFloorId={floorId}
          onFloorChange={setSelectedFloorId}
          canvasWidth={selectedFloor.grid_width}
          canvasHeight={selectedFloor.grid_height}
        />
      )}
      <MesasTable mesas={mesasFiltradas} floors={localFloors} />
    </div>
  )
}
