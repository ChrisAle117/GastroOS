"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categoriaSchema } from './schemas'
import { createCategoria, updateCategoria, deleteCategoria } from './actions'
import { X, Plus, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Categoria = {
  id: number
  nombre: string
  descripcion: string | null
  icono: string | null
  color: string | null
  orden: number
  activo: boolean
}

type Props = {
  categoria?: Categoria
}

const iconosDisponibles = [
  'UtensilsCrossed', 'Coffee', 'IceCream', 'Pizza', 'Salad', 
  'Soup', 'Wine', 'Beer', 'Leaf', 'Cake'
]

const coloresDisponibles = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
]

export default function CategoriaDialog({ categoria }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: zodResolver(categoriaSchema),
    defaultValues: categoria || {
      nombre: '',
      descripcion: '',
      icono: 'UtensilsCrossed',
      color: '#f59e0b',
      orden: 0,
      activo: true
    }
  })

  const iconoSeleccionado = watch('icono')
  const colorSeleccionado = watch('color')

  const onSubmit = async (data: any) => {
    setPending(true)
    try {
      if (categoria) {
        await updateCategoria(categoria.id, data)
      } else {
        await createCategoria(data)
      }
      setOpen(false)
      reset()
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Error al guardar categoría')
    } finally {
      setPending(false)
    }
  }

  const handleDelete = async () => {
    if (!categoria) return
    if (!confirm('¿Eliminar esta categoría? Los productos quedarán sin categoría.')) return

    setPending(true)
    try {
      await deleteCategoria(categoria.id)
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Error al eliminar categoría')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {categoria ? (
        <button
          onClick={() => setOpen(true)}
          className="p-2 hover:bg-zinc-700 rounded transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-xl font-semibold">
                {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre de la Categoría *
                </label>
                <input
                  {...register('nombre')}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="ej: Entradas, Platos Fuertes, Postres"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descripción
                </label>
                <textarea
                  {...register('descripcion')}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="Descripción breve de la categoría"
                  rows={2}
                />
              </div>

              {/* Icono */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Icono
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {iconosDisponibles.map((icono) => (
                    <button
                      key={icono}
                      type="button"
                      onClick={() => setValue('icono', icono)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        iconoSeleccionado === icono
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <div className="text-center text-xs">{icono}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('color', color)}
                      className={`h-10 rounded-lg border-2 transition-all ${
                        colorSeleccionado === color
                          ? 'border-white ring-2 ring-white/50'
                          : 'border-zinc-700'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Orden y Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Orden
                  </label>
                  <input
                    {...register('orden')}
                    type="number"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estado
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                    <input
                      {...register('activo')}
                      type="checkbox"
                      className="w-4 h-4"
                    />
                    <span>Activa</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {categoria && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={pending}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {pending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
