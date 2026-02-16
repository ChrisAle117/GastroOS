"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createSalonLabel,
  deleteSalonLabel,
  updateMesaLayout,
  updateMesasGroup,
  updateMesasLayoutBulk,
  updateSalonLabel,
} from './actions'
import { Grid3x3, Link2, Shapes, Trash2, Unlink } from 'lucide-react'
import EditMesaDialog from './edit-mesa-dialog'

type Mesa = {
  id: string
  nombre: string
  posicion_x: number
  posicion_y: number
  estado: 'libre' | 'ocupada' | 'sucia'
  capacidad?: number | null
  width?: number | null
  height?: number | null
  shape?: 'rect' | 'round' | 'bar' | null
  grupo_id?: string | null
  salon_floor_id?: string | null
}

type SalonLabel = {
  id: string
  nombre: string
  x: number
  y: number
  salon_floor_id?: string | null
}

type Floor = {
  id: string
  nombre: string
}

type MesasMapProps = {
  mesas: Mesa[]
  labels: SalonLabel[]
  floors: Floor[]
  selectedFloorId: string | null
  onFloorChange: (floorId: string) => void
  canvasWidth: number
  canvasHeight: number
}

type DragState =
  | {
      type: 'drag'
      pointerId: number
      startX: number
      startY: number
      startPositions: Record<string, { x: number; y: number }>
      selection: string[]
    }
  | {
      type: 'resize'
      pointerId: number
      mesaId: string
      startX: number
      startY: number
      startWidth: number
      startHeight: number
    }
  | {
      type: 'label'
      pointerId: number
      labelId: string
      startX: number
      startY: number
      startPos: { x: number; y: number }
    }
  | {
      type: 'box-select'
      pointerId: number
      startX: number
      startY: number
      startCanvasX: number
      startCanvasY: number
      addToSelection: boolean
    }

const GRID_SIZE = 24
const MIN_SIZE = 48
const DEFAULT_SIZE = 72

export default function MesasMap({ mesas, labels, floors, selectedFloorId, onFloorChange, canvasWidth, canvasHeight }: MesasMapProps) {
  const floorId = selectedFloorId
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const [localMesas, setLocalMesas] = useState<Mesa[]>(mesas)
  const [localLabels, setLocalLabels] = useState<SalonLabel[]>(labels)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [labelName, setLabelName] = useState('')
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null)
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [shapeMenuMesaId, setShapeMenuMesaId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => setLocalMesas(mesas), [mesas])
  useEffect(() => setLocalLabels(labels), [labels])

  // Close shape menu when dragging or scrolling
  useEffect(() => {
    if (dragRef.current) {
      setShapeMenuMesaId(null)
    }
  }, [localMesas])


  const estadoColor = useMemo(() => ({
    libre: 'bg-emerald-500/90 border-emerald-400',
    ocupada: 'bg-red-500/90 border-red-400',
    sucia: 'bg-amber-500/90 border-amber-400',
  }), [])

  const shapeClass = useMemo(() => ({
    rect: 'rounded-2xl',
    round: 'rounded-full',
    bar: 'rounded-xl',
  }), [])

  const snap = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

  const getMesaLayout = (mesa: Mesa) => ({
    width: mesa.width ?? DEFAULT_SIZE,
    height: mesa.height ?? DEFAULT_SIZE,
    shape: mesa.shape ?? 'rect',
  })

  const getGroupMembers = (mesaId: string) => {
    const mesa = localMesas.find((item) => item.id === mesaId)
    const groupId = mesa?.grupo_id
    if (!groupId) return [mesaId]
    return localMesas.filter((item) => item.grupo_id === groupId).map((item) => item.id)
  }

  const selectionHasGroup = selectedIds.some((id) => {
    const mesa = localMesas.find((item) => item.id === id)
    return !!mesa?.grupo_id
  })

  const getBounds = (mesa: Mesa) => {
    const layout = getMesaLayout(mesa)
    return {
      left: mesa.posicion_x,
      top: mesa.posicion_y,
      right: mesa.posicion_x + layout.width,
      bottom: mesa.posicion_y + layout.height,
      width: layout.width,
      height: layout.height,
    }
  }

  const isOverlapping = (a: Mesa, b: Mesa) => {
    const boundsA = getBounds(a)
    const boundsB = getBounds(b)
    return !(
      boundsA.right <= boundsB.left ||
      boundsA.left >= boundsB.right ||
      boundsA.bottom <= boundsB.top ||
      boundsA.top >= boundsB.bottom
    )
  }

  const findNearestFreeSpot = (mesa: Mesa, target: Mesa, bounds: { width: number; height: number }) => {
    const layout = getMesaLayout(mesa)
    const targetBounds = getBounds(target)
    const candidates = [
      { x: targetBounds.right + GRID_SIZE, y: targetBounds.top },
      { x: targetBounds.left - layout.width - GRID_SIZE, y: targetBounds.top },
      { x: targetBounds.left, y: targetBounds.bottom + GRID_SIZE },
      { x: targetBounds.left, y: targetBounds.top - layout.height - GRID_SIZE },
    ]

    for (const candidate of candidates) {
      const x = clamp(snap(candidate.x), 0, bounds.width - layout.width)
      const y = clamp(snap(candidate.y), 0, bounds.height - layout.height)
      const candidateMesa = { ...mesa, posicion_x: x, posicion_y: y }
      const overlaps = localMesas.some((other) => other.id !== mesa.id && isOverlapping(candidateMesa, other))
      if (!overlaps) return { x, y }
    }

    return null
  }

  const mergeGroups = (sourceId: string, targetId: string) => {
    const source = localMesas.find((mesa) => mesa.id === sourceId)
    const target = localMesas.find((mesa) => mesa.id === targetId)
    if (!source || !target) return

    const sourceGroupId = source.grupo_id ?? source.id
    const targetGroupId = target.grupo_id ?? target.id
    const groupId = target.grupo_id ?? target.id

    const ids = localMesas
      .filter((mesa) => mesa.id === sourceId || mesa.id === targetId || mesa.grupo_id === sourceGroupId || mesa.grupo_id === targetGroupId)
      .map((mesa) => mesa.id)

    // Determine best alignment based on available space
    const targetBounds = getBounds(target)
    const sourceLayout = getMesaLayout(source)
    
    // Calculate available space in both directions
    const spaceRight = canvasWidth - targetBounds.right
    const spaceBottom = canvasHeight - targetBounds.bottom
    
    // Try horizontal first if more space available, otherwise vertical
    let newX: number, newY: number
    
    if (spaceRight >= sourceLayout.width + GRID_SIZE && spaceRight > spaceBottom) {
      // Place to the right (horizontal)
      newX = snap(targetBounds.right + GRID_SIZE)
      newY = snap(targetBounds.top)
    } else {
      // Place below (vertical)
      newX = snap(targetBounds.left)
      newY = snap(targetBounds.bottom + GRID_SIZE)
    }
    
    // Clamp to canvas bounds
    newX = clamp(newX, 0, canvasWidth - sourceLayout.width)
    newY = clamp(newY, 0, canvasHeight - sourceLayout.height)
    
    setLocalMesas((prev) => prev.map((mesa) => {
      if (mesa.id === sourceId) {
        return { ...mesa, grupo_id: groupId, posicion_x: newX, posicion_y: newY }
      }
      if (ids.includes(mesa.id)) {
        return { ...mesa, grupo_id: groupId }
      }
      return mesa
    }))

    startTransition(async () => {
      try {
        await updateMesasGroup(ids, groupId)
        await updateMesasLayoutBulk([{ id: sourceId, posicion_x: newX, posicion_y: newY }])
        router.refresh()
      } catch (error) {
        console.error('Error al combinar mesas', error)
      }
    })
  }

  const clearGroups = () => {
    const ids = [...selectedIds]
    setLocalMesas((prev) => prev.map((mesa) => ids.includes(mesa.id) ? { ...mesa, grupo_id: null } : mesa))

    startTransition(async () => {
      try {
        await updateMesasGroup(ids, null)
        router.refresh()
      } catch (error) {
        console.error('Error al desagrupar mesas', error)
      }
    })
  }

  const ungroupMesa = (mesaId: string) => {
    const groupMembers = getGroupMembers(mesaId)
    setLocalMesas((prev) => prev.map((mesa) => groupMembers.includes(mesa.id) ? { ...mesa, grupo_id: null } : mesa))

    startTransition(async () => {
      try {
        await updateMesasGroup(groupMembers, null)
        router.refresh()
      } catch (error) {
        console.error('Error al desagrupar mesa', error)
      }
    })
  }

  const changeShape = (mesaId: string, newShape: 'rect' | 'round' | 'bar') => {
    setLocalMesas((prev) => prev.map((item) => item.id === mesaId ? { ...item, shape: newShape } : item))
    startTransition(async () => {
      try {
        await updateMesaLayout(mesaId, { shape: newShape })
        router.refresh()
      } catch (error) {
        console.error('Error al actualizar la forma', error)
      }
    })
    setShapeMenuMesaId(null)
  }

  const handlePointerDown = (event: React.PointerEvent, mesaId: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Ctrl key allows moving individual mesa even if grouped
    const groupMembers = event.ctrlKey ? [mesaId] : getGroupMembers(mesaId)
    let selection = groupMembers

    if (event.shiftKey) {
      const allSelected = groupMembers.every((id) => selectedIds.includes(id))
      selection = allSelected
        ? selectedIds.filter((id) => !groupMembers.includes(id))
        : Array.from(new Set([...selectedIds, ...groupMembers]))
    }

    setSelectedIds(selection)

    const startPositions: Record<string, { x: number; y: number }> = {}
    localMesas.forEach((mesa) => {
      if (selection.includes(mesa.id)) {
        startPositions[mesa.id] = { x: mesa.posicion_x, y: mesa.posicion_y }
      }
    })

    dragRef.current = {
      type: 'drag',
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPositions,
      selection,
    }

    ;(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
  }

  const handleResizePointerDown = (event: React.PointerEvent, mesaId: string) => {
    event.stopPropagation()
    const mesa = localMesas.find((item) => item.id === mesaId)
    if (!mesa) return
    const layout = getMesaLayout(mesa)

    dragRef.current = {
      type: 'resize',
      pointerId: event.pointerId,
      mesaId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: layout.width,
      startHeight: layout.height,
    }

    ;(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
  }

  const handleLabelPointerDown = (event: React.PointerEvent, labelId: string) => {
    event.stopPropagation()
    const label = localLabels.find((item) => item.id === labelId)
    if (!label) return

    dragRef.current = {
      type: 'label',
      pointerId: event.pointerId,
      labelId,
      startX: event.clientX,
      startY: event.clientY,
      startPos: { x: label.x, y: label.y },
    }

    ;(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current
    const canvas = canvasRef.current
    if (!drag || !canvas) return

    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY

    if (drag.type === 'box-select') {
      const rect = canvas.getBoundingClientRect()
      const currentX = event.clientX - rect.left + canvas.parentElement!.scrollLeft
      const currentY = event.clientY - rect.top + canvas.parentElement!.scrollTop
      
      const x = Math.min(drag.startCanvasX, currentX)
      const y = Math.min(drag.startCanvasY, currentY)
      const width = Math.abs(currentX - drag.startCanvasX)
      const height = Math.abs(currentY - drag.startCanvasY)
      
      setSelectionBox({ x, y, width, height })
      return
    }

    if (drag.type === 'drag') {
      setLocalMesas((prev) => prev.map((mesa) => {
        if (!drag.selection.includes(mesa.id)) return mesa
        const layout = getMesaLayout(mesa)
        const start = drag.startPositions[mesa.id]
        const x = clamp(snap(start.x + deltaX), 0, canvasWidth - layout.width)
        const y = clamp(snap(start.y + deltaY), 0, canvasHeight - layout.height)
        return { ...mesa, posicion_x: x, posicion_y: y }
      }))
    }

    if (drag.type === 'resize') {
      const width = Math.max(MIN_SIZE, snap(drag.startWidth + deltaX))
      const height = Math.max(MIN_SIZE, snap(drag.startHeight + deltaY))
      setLocalMesas((prev) => prev.map((mesa) => mesa.id === drag.mesaId
        ? { ...mesa, width, height }
        : mesa
      ))
    }

    if (drag.type === 'label') {
      const x = snap(drag.startPos.x + deltaX)
      const y = snap(drag.startPos.y + deltaY)
      setLocalLabels((prev) => prev.map((label) => label.id === drag.labelId ? { ...label, x, y } : label))
    }
  }

  const resolveOverlap = (mesaId: string, bounds: { width: number; height: number }) => {
    const mesa = localMesas.find((item) => item.id === mesaId)
    if (!mesa) return false

    const overlapped = localMesas.find((other) => other.id !== mesaId && isOverlapping(mesa, other))
    if (!overlapped) return false

    const position = findNearestFreeSpot(mesa, overlapped, bounds)
    if (position) {
      setLocalMesas((prev) => prev.map((item) => item.id === mesaId
        ? { ...item, posicion_x: position.x, posicion_y: position.y }
        : item
      ))
    }

    mergeGroups(mesaId, overlapped.id)
    return true
  }

  const handlePointerUp = (event: React.PointerEvent) => {
    const drag = dragRef.current
    const canvas = canvasRef.current
    if (!drag || !canvas) return

    dragRef.current = null
    ;(event.currentTarget as HTMLDivElement).releasePointerCapture(event.pointerId)

    if (drag.type === 'box-select') {
      if (selectionBox) {
        const selectedMesas = localMesas.filter((mesa) => {
          const bounds = getBounds(mesa)
          return (
            bounds.left < selectionBox.x + selectionBox.width &&
            bounds.right > selectionBox.x &&
            bounds.top < selectionBox.y + selectionBox.height &&
            bounds.bottom > selectionBox.y
          )
        })
        
        const newSelectedIds = selectedMesas.map((mesa) => mesa.id)
        
        if (drag.addToSelection) {
          // Add to existing selection
          setSelectedIds((prev) => Array.from(new Set([...prev, ...newSelectedIds])))
        } else {
          setSelectedIds(newSelectedIds)
        }
      }
      setSelectionBox(null)
      return
    }

    if (drag.type === 'drag') {
      const bounds = { width: canvasWidth, height: canvasHeight }
      drag.selection.forEach((id) => resolveOverlap(id, bounds))

      const updates = drag.selection
        .map((id) => localMesas.find((mesa) => mesa.id === id))
        .filter((mesa): mesa is Mesa => !!mesa)
        .map((mesa) => ({ id: mesa.id, posicion_x: Math.round(mesa.posicion_x), posicion_y: Math.round(mesa.posicion_y) }))

      startTransition(async () => {
        try {
          await updateMesasLayoutBulk(updates)
        } catch (error) {
          console.error('Error al actualizar posiciones', error)
        }
      })
    }

    if (drag.type === 'resize') {
      const mesa = localMesas.find((item) => item.id === drag.mesaId)
      if (!mesa) return
      const layout = getMesaLayout(mesa)

      startTransition(async () => {
        try {
          await updateMesaLayout(mesa.id, { width: layout.width, height: layout.height })
          router.refresh()
        } catch (error) {
          console.error('Error al actualizar el tamano', error)
        }
      })
    }

    if (drag.type === 'label') {
      const label = localLabels.find((item) => item.id === drag.labelId)
      if (!label) return

      startTransition(async () => {
        try {
          await updateSalonLabel(label.id, { x: label.x, y: label.y })
          router.refresh()
        } catch (error) {
          console.error('Error al actualizar el label', error)
        }
      })
    }
  }

  const addLabel = async (nombre: string) => {
    const value = nombre.trim()
    if (!value) return
    const x = snap(24 + localLabels.length * 48)
    const y = snap(24)

    try {
      const label = await createSalonLabel({ nombre: value, x, y, salon_floor_id: floorId })
      setLocalLabels((prev) => [...prev, label])
      setLabelName('')
    } catch (error) {
      console.error('Error al crear label', error)
    }
  }

  const removeLabel = async (id: string) => {
    try {
      await deleteSalonLabel(id)
      setLocalLabels((prev) => prev.filter((label) => label.id !== id))
    } catch (error) {
      console.error('Error al eliminar label', error)
    }
  }


  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-4 h-4 text-orange-500" />
            <h4 className="text-sm font-semibold">Diseno de salon</h4>
            <span className="text-zinc-500">-</span>
            <select
              value={selectedFloorId ?? ''}
              onChange={(event) => onFloorChange(event.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm"
            >
              {floors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.nombre}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-zinc-500">
            {isPending ? 'Guardando...' : 'Shift: multi-selección | Ctrl: mover mesa individual | Arrastrar en vacío: selección de área'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-400">Areas:</span>
          <div className="flex items-center gap-2">
            <input
              value={labelName}
              onChange={(event) => setLabelName(event.target.value)}
              placeholder="Nombre del area"
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={() => addLabel(labelName)}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              Agregar
            </button>
          </div>
          <button
            type="button"
            onClick={() => addLabel('Barra')}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            Barra
          </button>
          <button
            type="button"
            onClick={() => addLabel('Terraza')}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            Terraza
          </button>
          <button
            type="button"
            onClick={() => addLabel('VIP')}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            VIP
          </button>
          {selectionHasGroup && (
            <button
              type="button"
              onClick={clearGroups}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              Desagrupar
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          className="relative h-[520px] w-full rounded-lg border border-zinc-800 overflow-auto bg-zinc-950"
        >
          <div
            ref={canvasRef}
            className="relative bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:24px_24px]"
            style={{ width: canvasWidth, height: canvasHeight }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerDown={(event) => {
              if (event.target === canvasRef.current) {
                // Close shape menu when clicking on canvas
                if (shapeMenuMesaId) {
                  setShapeMenuMesaId(null)
                  return
                }
                // Start box selection
                const rect = canvasRef.current.getBoundingClientRect()
                const startCanvasX = event.clientX - rect.left + canvasRef.current.parentElement!.scrollLeft
                const startCanvasY = event.clientY - rect.top + canvasRef.current.parentElement!.scrollTop
                
                dragRef.current = {
                  type: 'box-select',
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY,
                  startCanvasX,
                  startCanvasY,
                  addToSelection: event.shiftKey,
                }
                
                if (!event.shiftKey) {
                  setSelectedIds([])
                }
                
                ;(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
              }
            }}
          >
          {localLabels.map((label) => (
            <div
              key={label.id}
              className="absolute text-xs uppercase tracking-widest text-zinc-400 border border-dashed border-zinc-600 px-3 py-1 rounded-full bg-zinc-900/80 cursor-move"
              style={{ left: label.x, top: label.y }}
              onPointerDown={(event) => handleLabelPointerDown(event, label.id)}
            >
              <div className="flex items-center gap-2">
                {label.nombre}
                <button
                  type="button"
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    removeLabel(label.id)
                  }}
                  className="text-zinc-500 hover:text-red-400"
                  title="Eliminar"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {selectionBox && (
            <div
              className="absolute border-2 border-orange-500 bg-orange-500/10 pointer-events-none"
              style={{
                left: selectionBox.x,
                top: selectionBox.y,
                width: selectionBox.width,
                height: selectionBox.height,
              }}
            />
          )}

              {localMesas.map((mesa) => {
            const layout = getMesaLayout(mesa)
            const isSelected = selectedIds.includes(mesa.id)
            const isGrouped = !!mesa.grupo_id

            return (
              <div
                key={mesa.id}
                className={`absolute flex flex-col items-center justify-center text-center text-white border shadow-lg cursor-grab active:cursor-grabbing select-none ${estadoColor[mesa.estado]} ${shapeClass[layout.shape]} ${isSelected ? 'ring-2 ring-orange-400' : ''}`}
                style={{
                  width: layout.width,
                  height: layout.height,
                  left: mesa.posicion_x,
                  top: mesa.posicion_y,
                }}
                onPointerDown={(event) => handlePointerDown(event, mesa.id)}
                onDoubleClick={(event) => {
                  event.stopPropagation()
                  setEditingMesa(mesa)
                }}
              >
                <div className="text-xs font-semibold flex items-center gap-1">
                  {mesa.nombre}
                  {isGrouped && <Link2 className="w-3 h-3 opacity-80" />}
                </div>
                <span className="text-[10px] uppercase tracking-wider opacity-80">{mesa.estado}</span>
                <span className="text-[10px] opacity-70">{mesa.capacidad ?? 4} pax</span>

                {/* Shape selector dropdown */}
                <div className="absolute -top-2 -right-2 z-50">
                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.stopPropagation()
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      setShapeMenuMesaId(shapeMenuMesaId === mesa.id ? null : mesa.id)
                    }}
                    className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 hover:border-orange-500 transition-colors relative z-10"
                    title="Cambiar forma"
                  >
                    <Shapes className="w-3 h-3" />
                  </button>
                  
                  {shapeMenuMesaId === mesa.id && (
                    <div 
                      className="absolute top-7 right-0 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-2 flex flex-col gap-1 z-[100] pointer-events-auto min-w-max"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => changeShape(mesa.id, 'rect')}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-700 rounded text-xs whitespace-nowrap transition-colors"
                      >
                        <div className="w-8 h-6 bg-emerald-500 rounded-2xl" />
                        <span>Rectangular</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => changeShape(mesa.id, 'round')}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-700 rounded text-xs whitespace-nowrap transition-colors"
                      >
                        <div className="w-6 h-6 bg-emerald-500 rounded-full" />
                        <span>Redonda</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => changeShape(mesa.id, 'bar')}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-700 rounded text-xs whitespace-nowrap transition-colors"
                      >
                        <div className="w-12 h-3 bg-emerald-500 rounded-lg" />
                        <span>Barra</span>
                      </button>
                    </div>
                  )}
                </div>

                {isGrouped && (
                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      ungroupMesa(mesa.id)
                    }}
                    className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] hover:bg-zinc-800 hover:border-orange-500 transition-colors"
                    title="Desagrupar"
                  >
                    <Unlink className="w-3 h-3" />
                  </button>
                )}

                <div
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-zinc-100 rounded-sm cursor-nwse-resize"
                  onPointerDown={(event) => handleResizePointerDown(event, mesa.id)}
                />
              </div>
            )
              })}
          </div>
        </div>
      </div>

      {editingMesa && (
        <div className="fixed inset-0 z-50">
          <EditMesaDialog 
            mesa={editingMesa} 
            floors={floors}
            open={!!editingMesa}
            onClose={() => setEditingMesa(null)}
          />
        </div>
      )}
    </div>
  )
}
