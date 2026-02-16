"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insumoSchema } from './schemas'
import { updateInsumo } from './actions'
import { Pencil, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Insumo = {
  id: number
  nombre: string
  unidad_medida: string
  stock_actual: number
  stock_minimo: number
  costo_unitario: number
}

export default function EditInsumoDialog({ insumo }: { insumo: Insumo }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(insumoSchema),
    defaultValues: {
      nombre: insumo.nombre,
      unidad_medida: insumo.unidad_medida,
      stock_actual: insumo.stock_actual,
      stock_minimo: insumo.stock_minimo,
      costo_unitario: insumo.costo_unitario,
    }
  })

  const onSubmit = async (data: any) => {
    try {
      await updateInsumo(insumo.id, data)
      setOpen(false)
      router.refresh()
    } catch (error) {
      alert('Error al actualizar el insumo')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-orange-500"
        title="Editar insumo"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Editar Insumo</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Insumo</label>
                <input
                  {...register('nombre')}
                  className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre.message as string}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Unidad de Medida</label>
                  <select
                    {...register('unidad_medida')}
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="g">Gramo (g)</option>
                    <option value="L">Litro (L)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="unidad">Unidad</option>
                    <option value="paquete">Paquete</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Costo Unitario</label>
                  <input
                    {...register('costo_unitario', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Actual</label>
                  <input
                    {...register('stock_actual', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stock Mínimo</label>
                  <input
                    {...register('stock_minimo', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
