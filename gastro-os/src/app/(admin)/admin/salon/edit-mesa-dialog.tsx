"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { mesaEditSchema } from './schemas'
import { updateMesaDetails } from './actions'
import { Pencil, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Mesa = {
  id: string
  nombre: string
  capacidad?: number | null
  width?: number | null
  height?: number | null
  shape?: 'rect' | 'round' | 'bar' | null
  salon_floor_id?: string | null
}

type Floor = {
  id: string
  nombre: string
}

type FormValues = {
  nombre: string
  capacidad?: number
  width?: number
  height?: number
  shape?: 'rect' | 'round' | 'bar'
  salon_floor_id?: string
}

type Props = {
  mesa: Mesa
  floors: Floor[]
  open?: boolean
  onClose?: () => void
}

export default function EditMesaDialog({ mesa, floors, open: controlledOpen, onClose }: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onClose ?? (() => {})) : setInternalOpen
  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(mesaEditSchema),
    defaultValues: {
      nombre: mesa.nombre,
      capacidad: mesa.capacidad ?? 4,
      width: mesa.width ?? 72,
      height: mesa.height ?? 72,
      shape: mesa.shape ?? 'rect',
      salon_floor_id: mesa.salon_floor_id ?? floors[0]?.id,
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await updateMesaDetails(mesa.id, data)
      router.refresh()
      if (isControlled && onClose) {
        onClose()
      } else {
        setInternalOpen(false)
      }
    } catch (error) {
      console.error('Error al actualizar la mesa', error)
      alert('Error al actualizar la mesa')
    }
  }

  const handleClose = () => {
    if (isControlled && onClose) {
      onClose()
    } else {
      setInternalOpen(false)
    }
  }

  return (
    <>
      {!isControlled && (
        <button
          onClick={() => setInternalOpen(true)}
          className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-orange-500"
          title="Editar mesa"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Editar Mesa</h2>
              <button
                onClick={handleClose}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  {...register('nombre')}
                  className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Capacidad</label>
                <input
                  {...register('capacidad')}
                  type="number"
                  min={1}
                  className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Ancho</label>
                  <input
                    {...register('width')}
                    type="number"
                    min={48}
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Alto</label>
                  <input
                    {...register('height')}
                    type="number"
                    min={48}
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Forma</label>
                <select
                  {...register('shape')}
                  className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="rect">Rectangular</option>
                  <option value="round">Redonda</option>
                  <option value="bar">Barra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Piso</label>
                <select
                  {...register('salon_floor_id')}
                  className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {floors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
