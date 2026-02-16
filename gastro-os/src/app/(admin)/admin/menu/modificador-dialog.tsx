"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { modificadorSchema } from './schemas'
import { createModificador, updateModificador, deleteModificador } from './actions'
import { X, Plus, Edit, Trash2, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Modificador = {
  id: number
  nombre: string
  tipo: 'extra' | 'exclusion'
  precio: number
  descripcion: string | null
  disponible: boolean
}

type Props = {
  modificador?: Modificador
}

export default function ModificadorDialog({ modificador }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(modificadorSchema),
    defaultValues: modificador || {
      nombre: '',
      tipo: 'extra',
      precio: 0,
      descripcion: '',
      disponible: true
    }
  })

  const tipo = watch('tipo')

  const onSubmit = async (data: any) => {
    setPending(true)
    try {
      // Si es exclusión, forzar precio a 0
      if (data.tipo === 'exclusion') {
        data.precio = 0
      }

      if (modificador) {
        await updateModificador(modificador.id, data)
      } else {
        await createModificador(data)
      }
      setOpen(false)
      reset()
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Error al guardar modificador')
    } finally {
      setPending(false)
    }
  }

  const handleDelete = async () => {
    if (!modificador) return
    if (!confirm('¿Eliminar este modificador?')) return

    setPending(true)
    try {
      await deleteModificador(modificador.id)
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Error al eliminar modificador')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {modificador ? (
        <button
          onClick={() => setOpen(true)}
          className="p-2 hover:bg-zinc-700 rounded transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Modificador
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-xl font-semibold">
                {modificador ? 'Editar Modificador' : 'Nuevo Modificador'}
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
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Tipo de Modificador *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer">
                    <input
                      {...register('tipo')}
                      type="radio"
                      value="extra"
                      className="peer sr-only"
                    />
                    <div className="p-4 border-2 rounded-lg transition-all peer-checked:border-green-500 peer-checked:bg-green-500/10 border-zinc-700">
                      <div className="font-medium">Extra</div>
                      <div className="text-sm text-zinc-400 mt-1">
                        Agregado con costo
                      </div>
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input
                      {...register('tipo')}
                      type="radio"
                      value="exclusion"
                      className="peer sr-only"
                    />
                    <div className="p-4 border-2 rounded-lg transition-all peer-checked:border-red-500 peer-checked:bg-red-500/10 border-zinc-700">
                      <div className="font-medium">Exclusión</div>
                      <div className="text-sm text-zinc-400 mt-1">
                        Quitar sin costo
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre *
                </label>
                <input
                  {...register('nombre')}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="ej: Extra Queso, Sin Cebolla"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                )}
              </div>

              {/* Precio (solo para extras) */}
              {tipo === 'extra' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Precio Adicional *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      {...register('precio')}
                      type="number"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.precio && (
                    <p className="text-red-500 text-sm mt-1">{errors.precio.message}</p>
                  )}
                </div>
              )}

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descripción
                </label>
                <textarea
                  {...register('descripcion')}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="Descripción opcional"
                  rows={2}
                />
              </div>

              {/* Disponible */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register('disponible')}
                    type="checkbox"
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Disponible</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {modificador && (
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
